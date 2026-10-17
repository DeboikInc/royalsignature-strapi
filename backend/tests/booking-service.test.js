'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const createBookingService = require('../src/api/booking/services/booking');

const accommodationType = {
  id: 1,
  documentId: 'type-1',
  publishedAt: '2026-01-01T00:00:00.000Z',
  adults: 2,
  children: 1,
};

const units = [
  { id: 11, name: 'Room 11', accommodation_type: accommodationType },
  { id: 12, name: 'Room 12', accommodation_type: accommodationType },
];

const rates = [{
  id: 4,
  accommodation_type: { id: 1, documentId: 'type-1', publishedAt: '2026-01-01T00:00:00.000Z' },
  season_prices: [
    { priority: 5, base_price: 150, season: { start_date: '2027-01-01', end_date: '2027-01-01' } },
    { priority: 0, base_price: 100, season: null },
  ],
}];

test('business status fields do not use Strapi document status columns', () => {
  const schemas = [
    ['accommodation', 'accommodation', 'unit_status'],
    ['rate', 'rate', 'rate_status'],
    ['availability-block', 'availability-block', 'block_status'],
    ['booking', 'booking', 'booking_status'],
    ['review', 'review', 'review_status'],
  ];

  for (const [api, contentType, field] of schemas) {
    const file = path.join(__dirname, '../src/api', api, 'content-types', contentType, 'schema.json');
    const { attributes } = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.ok(attributes[field], `${field} must exist`);
    assert.notEqual(attributes[field].columnName, 'status');
    assert.equal(Object.hasOwn(attributes, 'status'), false);
  }
});

test('idempotency intent matches only the same dates, guests, unit, rate, contact, and services', () => {
  const booking = {
    check_in_date: '2027-01-01',
    check_out_date: '2027-01-03',
    adults: 2,
    children: 0,
    accommodation: { id: 11 },
    rate: { id: 4 },
    guest_name: 'Local Test',
    guest_email: 'local@example.test',
    guest_phone: '+2348000000000',
    services: [{ id: 2 }, { id: 1 }],
  };
  const intent = {
    checkIn: '2027-01-01',
    checkOut: '2027-01-03',
    adults: 2,
    children: 0,
    unitId: 11,
    rateId: 4,
    guestName: 'Local Test',
    guestEmail: 'local@example.test',
    guestPhone: '+2348000000000',
    serviceIds: [1, 2],
  };

  assert.equal(createBookingService.sameBookingIntent(booking, intent), true);
  assert.equal(createBookingService.sameBookingIntent(booking, { ...intent, unitId: 12 }), false);
  assert.equal(createBookingService.sameBookingIntent(booking, { ...intent, checkOut: '2027-01-04' }), false);
});

function makeService(bookingsByUnit = {}, blocksByUnit = {}, customUnits = units, customRates = rates) {
  const strapi = {
    db: {
      query(uid) {
        return {
          async findMany(options = {}) {
            if (uid === 'api::accommodation.accommodation') return customUnits;
            if (uid === 'api::rate.rate') return customRates;
            if (uid === 'api::booking.booking') {
              const unitId = options.where.accommodation.id;
              return bookingsByUnit[unitId] || [];
            }
            if (uid === 'api::availability-block.availability-block') {
              const unitId = options.where.accommodation.id;
              return blocksByUnit[unitId] || [];
            }
            return [];
          },
        };
      },
    },
  };
  return createBookingService({ strapi });
}

const request = {
  accommodation_type: 1,
  check_in_date: '2027-01-01',
  check_out_date: '2027-01-03',
  adults: 2,
  children: 0,
};

test('groups available units and prices seasonal nights with fallback nights', async () => {
  const result = await makeService().listAvailable(request);
  assert.equal(result.length, 1);
  assert.equal(result[0].base_price, 250);
  assert.deepEqual(result[0].accommodations.map((unit) => unit.id), [11, 12]);
});

test('excludes units with an overlapping booking', async () => {
  const service = makeService({ 12: [{ id: 8, booking_status: 'confirmed' }] });
  const result = await service.listAvailable(request);
  assert.deepEqual(result[0].accommodations.map((unit) => unit.id), [11]);
});

test('rejects invalid date ranges', async () => {
  await assert.rejects(() => makeService().listAvailable({ ...request, check_out_date: request.check_in_date }), /Check-out must be after/);
});

test('returns no inventory when occupancy exceeds capacity', async () => {
  const result = await makeService().listAvailable({ ...request, adults: 3 });
  assert.deepEqual(result, []);
});

test('quotes the same seasonal total used by availability', () => {
  const service = makeService();
  const dates = service.getDates(request.check_in_date, request.check_out_date);
  assert.equal(service.quotePrice(rates[0], dates), 250);
});

test('prices each occupied night using its matching season and excludes checkout night', () => {
  const service = makeService();
  const rate = {
    season_prices: [
      { priority: 10, base_price: 200, season: { start_date: '2027-01-02', end_date: '2027-01-02' } },
      { priority: 5, base_price: 150, season: { start_date: '2027-01-01', end_date: '2027-01-01' } },
      { priority: 0, base_price: 100, season: null },
    ],
  };
  const dates = service.getDates('2027-01-01', '2027-01-04');
  assert.equal(service.quotePrice(rate, dates), 450);
});

test('charges one-time services once and per-day services for each night', () => {
  const service = makeService();
  assert.equal(service.serviceTotal([
    { price: 18000, repeatability: 'once' },
    { price: 7000, repeatability: 'per_day' },
  ], 3), 39000);
});

test('expired pending holds stop blocking while confirmed bookings continue to block', () => {
  const service = makeService();
  const now = Date.parse('2027-01-01T00:00:00.000Z');
  assert.equal(service.isBlockingBooking({ booking_status: 'pending-payment', expires_at: '2026-12-31T23:59:59.000Z' }, now), false);
  assert.equal(service.isBlockingBooking({ booking_status: 'pending-payment', expires_at: '2027-01-01T00:01:00.000Z' }, now), true);
  assert.equal(service.isBlockingBooking({ booking_status: 'confirmed', expires_at: '2026-12-31T23:59:59.000Z' }, now), true);
});

test('excludes units with an active overlapping availability block', async () => {
  const service = makeService({}, { 12: [{ id: 3, block_status: 'active' }] });
  const result = await service.listAvailable(request);
  assert.deepEqual(result[0].accommodations.map((unit) => unit.id), [11]);
});

test('excludes units whose capacity or rate stay limits do not fit the request', async () => {
  const smallUnit = { ...units[0], max_adults: 1 };
  const longStayRate = { ...rates[0], id: 5, minimum_stay: 3 };
  const unitLimited = await makeService({}, {}, [smallUnit], rates).listAvailable(request);
  const rateLimited = await makeService({}, {}, [units[0]], [longStayRate]).listAvailable({ ...request, rate_id: 5 });
  assert.deepEqual(unitLimited, []);
  assert.deepEqual(rateLimited, []);
});