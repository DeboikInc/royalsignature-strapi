'use strict';

module.exports = {
  expirePendingBookingHolds: {
    task: async ({ strapi }) => {
      const now = new Date().toISOString();
      const expired = await strapi.db.query('api::booking.booking').findMany({
        where: { booking_status: 'pending-payment', expires_at: { $lte: now } },
        limit: 1000,
      });
      for (const booking of expired) {
        await strapi.db.query('api::booking.booking').update({
          where: { id: booking.id },
          data: {
            booking_status: 'expired',
            payment_status: booking.payment_status === 'failed' ? 'failed' : 'abandoned',
          },
        });
      }
    },
    options: { rule: '*/5 * * * *' },
  },
};