'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { seed, rooms } = require('../scripts/seed');

function createStrapiMock() {
  const collections = new Map();
  let nextId = 1;
  return {
    collections,
    documents(uid) {
      if (!collections.has(uid)) collections.set(uid, new Map());
      const records = collections.get(uid);
      return {
        async findFirst({ filters }) {
          return [...records.values()].find((record) => record.seed_key === filters.seed_key) || null;
        },
        async create({ data, status }) {
          const record = { ...data, documentId: `doc-${nextId++}`, status };
          records.set(record.seed_key, record);
          return record;
        },
        async update({ documentId, data, status }) {
          const current = [...records.values()].find((record) => record.documentId === documentId);
          const updated = { ...current, ...data, status };
          records.set(updated.seed_key, updated);
          return updated;
        },
      };
    },
  };
}

test('Royal Signature seed is repeatable and contains only supplied room rates', async () => {
  const strapi = createStrapiMock();
  const firstRun = await seed(strapi);
  const secondRun = await seed(strapi);
  const types = strapi.collections.get('api::accommodation-type.accommodation-type');
  const rates = strapi.collections.get('api::rate.rate');

  assert.deepEqual(firstRun, secondRun);
  assert.equal(types.size, 5);
  assert.equal(rates.size, 5);
  assert.equal([...strapi.collections.values()].reduce((total, records) => total + records.size, 0), 31);
  assert.deepEqual([...rates.values()].map((rate) => Number(rate.season_prices[0].base_price)).sort((a, b) => a - b), [25000, 30000, 40000, 50000, 100000]);
  assert.equal(rooms.length, 5);
  assert.equal(strapi.collections.has('api::accommodation.accommodation'), false);
  assert.equal(strapi.collections.has('api::review.review'), false);
  assert.equal(strapi.collections.has('api::booking.booking'), false);
});