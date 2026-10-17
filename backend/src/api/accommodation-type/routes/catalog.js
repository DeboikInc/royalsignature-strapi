'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/accommodation-types', handler: 'accommodation-type.accommodationTypes', config: { auth: false } },
    { method: 'GET', path: '/accommodation-types/by-slug/:slug', handler: 'accommodation-type.accommodationTypeBySlug', config: { auth: false } },
    { method: 'GET', path: '/accommodation-types/:id', handler: 'accommodation-type.accommodationType', config: { auth: false } },
    { method: 'GET', path: '/rates', handler: 'accommodation-type.rates', config: { auth: false } },
    { method: 'GET', path: '/rates/:id', handler: 'accommodation-type.rate', config: { auth: false } },
    { method: 'GET', path: '/services', handler: 'accommodation-type.services', config: { auth: false } },
  ],
};