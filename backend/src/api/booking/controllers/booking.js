'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { timingSafeEqual } = require('node:crypto');

const sameSecret = (received, expected) => {
  if (!received || !expected) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
};

module.exports = createCoreController('api::booking.booking', ({ strapi }) => ({
  async checkAvailability(ctx) {
    try {
      const availability = await strapi.service('api::booking.booking').listAvailable(ctx.request.body || {});
      ctx.body = { availability };
    } catch (error) {
      return ctx.badRequest(error.message || 'Invalid availability request');
    }
  },

  async createPublic(ctx) {
    try {
      ctx.body = await strapi.service('api::booking.booking').create(ctx.request.body || {});
      ctx.status = 201;
    } catch (error) {
      const status = /no longer available|reserve this accommodation|idempotency key/i.test(error.message) ? 409 : 400;
      ctx.status = status;
      ctx.body = { error: error.message || 'Unable to create booking' };
    }
  },

  async findPublic(ctx) {
    const booking = await strapi.db.query('api::booking.booking').findOne({
      where: { booking_reference: ctx.params.reference },
      populate: { accommodation_type: true, accommodation: true, rate: true, services: true },
    });
    if (!booking) return ctx.notFound('Booking not found');
    ctx.body = {
      id: booking.booking_reference,
      status: booking.booking_status,
      currency: booking.currency,
      total_price: booking.total_price,
      customer: booking.customer_details,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      accommodation_type_id: booking.accommodation_type?.id,
      accommodation_id: booking.accommodation?.id,
      rate_id: booking.rate?.id,
      services: booking.services,
      payment_reference: booking.payment_reference,
      payment_status: booking.payment_status,
      expires_at: booking.expires_at,
    };
  },

  async confirm(ctx) {
    const configuredSecret = process.env.INTERNAL_WEBHOOK_SECRET;
    if (!sameSecret(ctx.get('x-webhook-secret'), configuredSecret)) return ctx.unauthorized('Invalid webhook secret');

    const body = ctx.request.body || {};
    const booking = await strapi.db.query('api::booking.booking').findOne({
      where: { booking_reference: ctx.params.reference },
    });
    if (!booking) return ctx.notFound('Booking not found');
    if (body.gateway !== 'paystack' || !String(body.tx_ref || '').trim()) {
      return ctx.badRequest('Payment gateway and reference are required');
    }
    if (Math.round(Number(body.amount) * 100) !== Math.round(Number(booking.total_price) * 100)) return ctx.badRequest('Payment amount does not match the booking total');
    if (booking.booking_status === 'confirmed' && booking.payment_reference === body.tx_ref) {
      ctx.body = { id: booking.booking_reference, status: booking.booking_status };
      return;
    }
    if (booking.booking_status !== 'pending-payment' || booking.payment_reference !== body.tx_ref || booking.payment_gateway !== body.gateway) {
      return ctx.conflict('Booking is no longer awaiting this payment');
    }
    if (!booking.expires_at || new Date(booking.expires_at).valueOf() <= Date.now()) return ctx.conflict('Booking payment hold has expired');

    await strapi.db.query('api::booking.booking').update({
      where: { id: booking.id },
      data: {
        booking_status: 'confirmed',
        payment_status: 'succeeded',
        payment_gateway: body.gateway,
        payment_reference: String(body.tx_ref),
        expires_at: null,
      },
    });
    ctx.body = { id: booking.booking_reference, status: 'confirmed' };
  },

  async paymentAttempt(ctx) {
    if (!sameSecret(ctx.get('x-webhook-secret'), process.env.INTERNAL_WEBHOOK_SECRET)) return ctx.unauthorized('Invalid payment service secret');
    const body = ctx.request.body || {};
    const booking = await strapi.db.query('api::booking.booking').findOne({ where: { booking_reference: ctx.params.reference } });
    if (!booking) return ctx.notFound('Booking not found');
    if (booking.booking_status !== 'pending-payment' || !booking.expires_at || new Date(booking.expires_at).valueOf() <= Date.now()) {
      return ctx.conflict('Booking payment hold has expired');
    }
    if (body.gateway !== 'paystack' || !/^bk_[0-9a-f-]+_[0-9a-f-]+$/i.test(String(body.tx_ref || ''))) {
      return ctx.badRequest('A valid Paystack payment reference is required');
    }
    await strapi.db.query('api::booking.booking').update({
      where: { id: booking.id },
      data: { payment_gateway: 'paystack', payment_reference: body.tx_ref, payment_status: 'pending' },
    });
    ctx.body = { id: booking.booking_reference, payment_status: 'pending' };
  },

  async paymentState(ctx) {
    if (!sameSecret(ctx.get('x-webhook-secret'), process.env.INTERNAL_WEBHOOK_SECRET)) return ctx.unauthorized('Invalid payment service secret');
    const body = ctx.request.body || {};
    const booking = await strapi.db.query('api::booking.booking').findOne({ where: { booking_reference: ctx.params.reference } });
    if (!booking) return ctx.notFound('Booking not found');
    if (booking.booking_status === 'confirmed') {
      ctx.body = { id: booking.booking_reference, status: booking.booking_status, payment_status: booking.payment_status };
      return;
    }
    if (booking.booking_status !== 'pending-payment' || booking.payment_gateway !== 'paystack' || booking.payment_reference !== body.tx_ref) {
      return ctx.conflict('Payment event does not match the active booking attempt');
    }
    if (!['pending', 'failed', 'abandoned'].includes(body.payment_status)) return ctx.badRequest('Unsupported payment state');
    await strapi.db.query('api::booking.booking').update({
      where: { id: booking.id },
      data: { payment_status: body.payment_status },
    });
    ctx.body = { id: booking.booking_reference, status: booking.booking_status, payment_status: body.payment_status };
  },
}));