'use strict';

module.exports = {
  routes: [
    { method: 'POST', path: '/availability/check', handler: 'booking.checkAvailability', config: { auth: false } },
    { method: 'POST', path: '/bookings', handler: 'booking.createPublic' },
    { method: 'GET', path: '/bookings/:reference', handler: 'booking.findPublic' },
    { method: 'POST', path: '/bookings/:reference/payment-attempt', handler: 'booking.paymentAttempt' },
    { method: 'POST', path: '/bookings/:reference/payment-state', handler: 'booking.paymentState' },
    { method: 'POST', path: '/bookings/:reference/confirm', handler: 'booking.confirm' },
  ],
};