'use strict';

const { randomUUID } = require('node:crypto');
const { findPublishedAccommodationType } = require('../../../lib/publishedAccommodationType');

const parseDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value ? null : date;
};

const getDates = (checkIn, checkOut) => {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  if (!start || !end || end <= start) return null;
  return { start, end, nights: (end - start) / 86400000 };
};

const dateRange = ({ start, nights }) => Array.from({ length: nights }, (_, index) => {
  const night = new Date(start);
  night.setUTCDate(start.getUTCDate() + index);
  return night;
});

const coversNight = (season, night) => {
  const day = night.toISOString().slice(0, 10);
  return (!season?.start_date || season.start_date <= day) && (!season?.end_date || season.end_date >= day);
};

const getNightlyPrices = (rate, nights) => {
  const prices = [...(rate?.season_prices || [])].sort((left, right) => (right.priority || 0) - (left.priority || 0));
  const nightlyPrices = dateRange(nights).map((night) => {
    const seasonal = prices.find((item) => item.season && coversNight(item.season, night));
    const fallback = prices.find((item) => !item.season);
    const price = seasonal || fallback;
    return { date: night.toISOString().slice(0, 10), amount: price ? Number(price.base_price) : null };
  });
  if (!nightlyPrices.length || nightlyPrices.some(({ amount }) => !Number.isFinite(amount) || amount < 0)) return null;
  return nightlyPrices;
};

const choosePrice = (rate, nights) => {
  const nightlyPrices = getNightlyPrices(rate, nights);
  return nightlyPrices?.reduce((total, { amount }) => total + amount, 0) ?? null;
};

const rateMatchesStay = (rate, type, nights) => {
  const minimum = Math.max(Number(type.minimum_nights) || 1, Number(rate.minimum_stay) || 1);
  const maximum = [type.maximum_nights, rate.maximum_stay].map(Number).filter((value) => Number.isInteger(value) && value > 0);
  return nights >= minimum && (!maximum.length || nights <= Math.min(...maximum));
};

const getOccupancy = (payload) => {
  const adults = Number(payload.adults);
  const children = Number(payload.children ?? 0);
  if (!Number.isInteger(adults) || adults < 1 || adults > 6) return null;
  if (!Number.isInteger(children) || children < 0 || children > 4) return null;
  return { adults, children };
};

const serviceTotal = (selectedServices, nights) => selectedServices.reduce((total, service) => {
  const price = Number(service.price || 0);
  return total + price * (service.repeatability === 'per_day' ? nights : 1);
}, 0);

const isBlockingBooking = (booking, now = Date.now()) => {
  if (booking.booking_status === 'confirmed') return true;
  if (booking.booking_status !== 'pending-payment' || !booking.expires_at) return false;
  return new Date(booking.expires_at).valueOf() > now;
};

const blockingOverlapFilter = (checkIn, checkOut, now = new Date().toISOString()) => ({
  check_in_date: { $lt: checkOut },
  check_out_date: { $gt: checkIn },
  $or: [
    { booking_status: 'confirmed' },
    { booking_status: 'pending-payment', expires_at: { $gt: now } },
  ],
});

const availabilityBlockFilter = (checkIn, checkOut) => ({
  block_status: 'active',
  check_in_date: { $lt: checkOut },
  check_out_date: { $gt: checkIn },
});

const sameBookingIntent = (booking, intent) => {
  const bookedServices = (booking.services || []).map((service) => Number(service.id)).sort((left, right) => left - right);
  const requestedServices = [...intent.serviceIds].sort((left, right) => left - right);
  return booking.check_in_date === intent.checkIn
    && booking.check_out_date === intent.checkOut
    && Number(booking.adults) === intent.adults
    && Number(booking.children) === intent.children
    && Number(booking.accommodation?.id) === intent.unitId
    && Number(booking.rate?.id) === intent.rateId
    && booking.guest_name === intent.guestName
    && booking.guest_email === intent.guestEmail
    && booking.guest_phone === intent.guestPhone
    && JSON.stringify(bookedServices) === JSON.stringify(requestedServices);
};

const listAvailable = async (strapi, input) => {
  const dates = getDates(input.check_in_date, input.check_out_date);
  const occupancy = getOccupancy(input);
  if (!dates) throw new Error('Check-out must be after a valid check-in date');
  if (!occupancy) throw new Error('Adults and children are invalid');

  const typeId = Number(input.accommodation_type);
  const units = await strapi.db.query('api::accommodation.accommodation').findMany({
    where: {
      unit_status: 'active',
    },
    populate: { accommodation_type: true },
    orderBy: { id: 'asc' },
    limit: 500,
  });

  if (Number.isInteger(typeId) && typeId > 0 && units.length === 0) {
    const type = await strapi.db.query('api::accommodation-type.accommodation-type').findOne({ where: { id: typeId, publishedAt: { $notNull: true } } });
    if (!type) throw new Error('Accommodation type was not found');
  }

  const rawRates = await strapi.db.query('api::rate.rate').findMany({
    where: { rate_status: 'active' },
    populate: { season_prices: { populate: { season: true } }, accommodation_type: true },
    limit: 500,
  });
  const rates = (await Promise.all(rawRates.map(async (rate) => {
    const type = await findPublishedAccommodationType(strapi, rate.accommodation_type);
    return type ? { ...rate, accommodation_type: type } : null;
  }))).filter(Boolean);
  const groupedAvailability = new Map();

  for (const unit of units) {
    const type = await findPublishedAccommodationType(strapi, unit.accommodation_type);
    if (!type || (Number.isInteger(typeId) && typeId > 0 && type.id !== typeId)) continue;
    const maxAdults = unit.max_adults ?? type.adults;
    const maxChildren = unit.max_children ?? type.children;
    if ((maxAdults != null && occupancy.adults > maxAdults) || (maxChildren != null && occupancy.children > maxChildren)) continue;

    const overlapping = await strapi.db.query('api::booking.booking').findMany({
      where: {
        accommodation: { id: unit.id },
        ...blockingOverlapFilter(input.check_in_date, input.check_out_date),
      },
      limit: 1,
    });
    if (overlapping.length) continue;

    const blocks = await strapi.db.query('api::availability-block.availability-block').findMany({
      where: {
        accommodation: { id: unit.id },
        ...availabilityBlockFilter(input.check_in_date, input.check_out_date),
      },
      limit: 1,
    });
    if (blocks.length) continue;

    const typeRates = rates.filter((rate) => rate.accommodation_type?.id === type.id && rateMatchesStay(rate, type, dates.nights)).sort((left, right) => left.id - right.id);
    const requestedRate = Number(input.rate_id);
    const rate = typeRates.find((item) => requestedRate > 0 && item.id === requestedRate) || typeRates[0];
    const basePrice = rate ? choosePrice(rate, dates) : null;
    if (!rate || basePrice === null) continue;
    const key = `${type.id}:${rate.id}`;
    if (!groupedAvailability.has(key)) {
      groupedAvailability.set(key, {
        accommodation_type: type.id,
        rate_id: rate.id,
        base_price: basePrice,
        currency: rate.currency || 'NGN',
        accommodations: [],
      });
    }
    groupedAvailability.get(key).accommodations.push({ id: unit.id, name: unit.name });
  }

  return Array.from(groupedAvailability.values());
};

module.exports = ({ strapi }) => ({
  getDates,
  getOccupancy,
  getNightlyPrices,
  serviceTotal,
  isBlockingBooking,
  quotePrice: (rate, dates) => choosePrice(rate, dates),
  listAvailable: (input) => listAvailable(strapi, input),
  async create(input) {
    const dates = getDates(input.check_in_date, input.check_out_date);
    const occupancy = getOccupancy(input.reserved_accommodations?.[0] || {});
    const reserved = input.reserved_accommodations?.[0];
    const unitId = Number(reserved?.accommodation);
    const rateId = Number(input.rate_id);
    if (!dates) throw new Error('Check-out must be after a valid check-in date');
    if (!occupancy) throw new Error('Adults and children are invalid');
    if (!Number.isInteger(unitId) || unitId < 1) throw new Error('A valid accommodation unit is required');

    const unit = await strapi.db.query('api::accommodation.accommodation').findOne({
      where: { id: unitId, unit_status: 'active' },
      populate: { accommodation_type: true },
    });
    const type = await findPublishedAccommodationType(strapi, unit?.accommodation_type);
    if (!type) throw new Error('Accommodation unit was not found');
    const maxAdults = unit.max_adults ?? type.adults;
    const maxChildren = unit.max_children ?? type.children;
    if ((maxAdults != null && occupancy.adults > maxAdults) || (maxChildren != null && occupancy.children > maxChildren)) {
      throw new Error('Guest count exceeds accommodation capacity');
    }

    const rawRate = await strapi.db.query('api::rate.rate').findOne({
      where: { id: rateId, rate_status: 'active' },
      populate: { accommodation_type: true, season_prices: { populate: { season: true } } },
    });
    const rateType = await findPublishedAccommodationType(strapi, rawRate?.accommodation_type);
    const rate = rateType?.documentId === type.documentId ? { ...rawRate, accommodation_type: rateType } : null;
    if (!rate) throw new Error('An active rate for this accommodation is required');
    if (!rateMatchesStay(rate, type, dates.nights)) throw new Error('Selected stay length is outside the rate plan limits');
    const roomPrice = choosePrice(rate, dates);
    if (roomPrice === null) throw new Error('No configured seasonal price covers the selected dates');

    const requestedServiceIds = (reserved.services || []).map((service) => Number(typeof service === 'object' ? service.id : service)).filter(Number.isInteger);
    const rawServices = requestedServiceIds.length
      ? await strapi.db.query('api::service.service').findMany({
        where: { id: { $in: requestedServiceIds } },
        populate: { accommodation_types: true },
      })
      : [];
    const services = rawServices.filter((service) => service.accommodation_types?.some((accommodationType) => accommodationType.documentId === type.documentId));
    if (services.length !== new Set(requestedServiceIds).size) throw new Error('One or more selected services are invalid');

    const additionalServicesTotal = serviceTotal(services, dates.nights);
    const totalPrice = roomPrice + additionalServicesTotal;
    const currency = rate.currency || 'NGN';
    const serviceBreakdown = services.map((service) => {
      const quantity = service.repeatability === 'per_day' ? dates.nights : 1;
      const unitPrice = Number(service.price || 0);
      return { service_id: service.id, name: service.title, quantity, unit_price: unitPrice, total: unitPrice * quantity };
    });
    const priceBreakdown = {
      nights: dates.nights,
      nightly_accommodation: getNightlyPrices(rate, dates),
      accommodation_total: roomPrice,
      services: serviceBreakdown,
      taxes: 0,
      total: totalPrice,
      currency,
    };
    const customer = input.customer || {};
    if (input.guest_consent !== true) throw new Error('Guest consent is required to create a booking');
    if (!String(customer.first_name || '').trim() || !String(customer.last_name || '').trim()) throw new Error('Guest name is required');
    if (!/^\S+@\S+\.\S+$/.test(String(customer.email || ''))) throw new Error('A valid guest email is required');
    const guestName = `${customer.first_name.trim()} ${customer.last_name.trim()}`;
    const guestEmail = String(customer.email).trim().toLowerCase();
    const guestPhone = String(customer.phone || '').trim();
    const idempotencyKey = String(input.idempotency_key || '').trim();
    if (idempotencyKey.length > 128) throw new Error('Idempotency key must be 128 characters or fewer');
    const intent = {
      checkIn: input.check_in_date,
      checkOut: input.check_out_date,
      adults: occupancy.adults,
      children: occupancy.children,
      unitId,
      rateId,
      guestName,
      guestEmail,
      guestPhone,
      serviceIds: services.map((service) => service.id),
    };
    const findByIdempotencyKey = () => strapi.db.query('api::booking.booking').findOne({
      where: { idempotency_key: idempotencyKey },
      populate: { accommodation: true, rate: true, services: true },
    });
    const responseForBooking = (booking, message) => ({
      id: booking.booking_reference,
      status: booking.booking_status,
      currency: booking.currency,
      total_price: booking.total_price,
      customer: booking.customer_details || customer,
      message,
    });

    if (idempotencyKey) {
      const existing = await findByIdempotencyKey();
      if (existing) {
        if (!sameBookingIntent(existing, intent)) throw new Error('Idempotency key is already used for a different booking');
        return responseForBooking(existing, 'Booking already created for this request');
      }
    }

    const bookingReference = randomUUID();
    const lockName = `royal-signature-unit-${unit.id}`;
    let created;
    try {
      await strapi.db.transaction(async ({ trx }) => {
      const lockResult = await trx.raw('SELECT GET_LOCK(?, 10) AS acquired', [lockName]);
      const acquired = lockResult?.[0]?.[0]?.acquired ?? lockResult?.[0]?.acquired;
      if (Number(acquired) !== 1) throw new Error('Could not reserve this accommodation. Please retry.');
      try {
        if (idempotencyKey) {
          const existing = await findByIdempotencyKey();
          if (existing) {
            if (!sameBookingIntent(existing, intent)) throw new Error('Idempotency key is already used for a different booking');
            created = existing;
            return;
          }
        }
        const overlapping = await strapi.db.query('api::booking.booking').findMany({
          where: {
            accommodation: { id: unit.id },
            ...blockingOverlapFilter(input.check_in_date, input.check_out_date),
          },
          limit: 1,
        });
        if (overlapping.length) throw new Error('This accommodation is no longer available for the selected dates');

        const blocks = await strapi.db.query('api::availability-block.availability-block').findMany({
          where: {
            accommodation: { id: unit.id },
            ...availabilityBlockFilter(input.check_in_date, input.check_out_date),
          },
          limit: 1,
        });
        if (blocks.length) throw new Error('This accommodation is blocked for the selected dates');

        created = await strapi.db.query('api::booking.booking').create({
          data: {
            booking_reference: bookingReference,
            idempotency_key: idempotencyKey || null,
            check_in_date: input.check_in_date,
            check_out_date: input.check_out_date,
            nights: dates.nights,
            adults: occupancy.adults,
            children: occupancy.children,
            accommodation_type: type.id,
            accommodation: unit.id,
            rate: rate.id,
            services: services.map((service) => service.id),
            guest_name: guestName,
            guest_email: guestEmail,
            guest_phone: guestPhone,
            customer_details: customer,
            guest_consent: true,
            special_requests: input.note || '',
            coupon_code: input.coupon_code || '',
            booking_status: 'pending-payment',
            payment_status: 'pending',
            total_price: totalPrice,
            price_breakdown: priceBreakdown,
            currency,
            expires_at: new Date(Date.now() + (Number(process.env.BOOKING_HOLD_MINUTES) || 30) * 60 * 1000).toISOString(),
          },
        });
      } finally {
        await trx.raw('SELECT RELEASE_LOCK(?)', [lockName]);
      }
      });
    } catch (error) {
      if (!idempotencyKey || !['ER_DUP_ENTRY', 'SQLITE_CONSTRAINT_UNIQUE'].includes(error.code)) throw error;
      const existing = await findByIdempotencyKey();
      if (!existing || !sameBookingIntent(existing, intent)) throw new Error('Idempotency key is already used for a different booking');
      created = existing;
    }
    const message = created.booking_reference === bookingReference
      ? 'Booking created and awaiting payment'
      : 'Booking already created for this request';
    return responseForBooking(created, message);
  },
});

module.exports.sameBookingIntent = sameBookingIntent;