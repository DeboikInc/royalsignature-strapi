'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/reviews', handler: 'review.findPublic', config: { auth: false } },
    { method: 'POST', path: '/reviews', handler: 'review.createPublic', config: { auth: false, middlewares: ['global::public-rate-limit'] } },
  ],
};