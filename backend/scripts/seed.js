'use strict';

const UIDS = {
  accommodationType: 'api::accommodation-type.accommodation-type',
  amenity: 'api::amenity.amenity',
  category: 'api::category.category',
  rate: 'api::rate.rate',
};

const categories = ['Rooms & Suites', 'Restaurant', 'Lounge', 'Events'];
const suggestedAmenities = [
  'Air conditioning', 'Smart TV', 'Wi-Fi', 'Ensuite bathroom', 'Work desk',
  'Balcony', 'Minibar', 'Lounge seating', 'Kitchen', 'Living room',
  'Dining area', 'Restaurant dining', 'Room service', 'Bar',
  'Conference facilities', 'Catering', 'Audiovisual equipment',
];

const rooms = [
  {
    slug: 'classic-room', title: 'Classic Room', price: 25000, adults: 2, children: 0,
    bed: '1 Queen bed', description: 'A comfortable, elegant retreat for the discerning traveller.',
    type: 'hotel-room',
  },
  {
    slug: 'executive-room', title: 'Executive Room', price: 30000, adults: 2, children: 0,
    bed: '1 King bed', description: 'Where comfort meets understated luxury.',
    type: 'hotel-room',
  },
  {
    slug: 'deluxe-room', title: 'Deluxe Room', price: 40000, adults: 2, children: 1,
    bed: '1 King bed', description: 'A comfortable and elegant retreat for a memorable stay.',
    type: 'hotel-room',
  },
  {
    slug: 'super-royal', title: 'Super Royal', price: 50000, adults: 2, children: 0,
    bed: '1 King bed', description: 'A refined retreat offering comfort and privacy for business and leisure travellers.',
    type: 'hotel-room',
  },
  {
    slug: 'apartment-amsterdams', title: "Apartment Amsterdam's", price: 100000, adults: 4, children: 2,
    bed: '1 King bed plus sofa bed', description: 'A spacious and refined apartment designed for guests who value extra room and comfort.',
    type: 'serviced-apartment',
  },
];

async function upsert(strapi, uid, key, data, publish = false) {
  const documents = strapi.documents(uid);
  const existing = await documents.findFirst({
    filters: { seed_key: key },
    ...(publish ? { status: 'draft' } : {}),
  });
  const input = {
    data: { ...data, seed_key: key },
    ...(publish ? { status: 'published' } : {}),
  };
  if (existing) {
    return documents.update({ documentId: existing.documentId, ...input });
  }
  return documents.create(input);
}

async function seed(strapi) {
  for (const [index, name] of categories.entries()) {
    await upsert(strapi, UIDS.category, `category:${index + 1}`, { name });
  }
  for (const amenity of suggestedAmenities) {
    const slug = amenity.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await upsert(strapi, UIDS.amenity, `suggested:${slug}`, { name: amenity });
  }

  for (const room of rooms) {
    const accommodation = await upsert(strapi, UIDS.accommodationType, `room:${room.slug}`, {
      title: room.title,
      slug: room.slug,
      description: room.description,
      excerpt: room.bed,
      property_type: room.type,
      featured: true,
      address_line1: 'Ojo Road',
      city: 'Ojo',
      state: 'Lagos',
      country: 'Nigeria',
      adults: room.adults,
      children: room.children,
      bed_type: room.bed,
      attributes: { client_confirmation_required: true },
    }, true);

    await upsert(strapi, UIDS.rate, `rate:${room.slug}:starting`, {
      title: `${room.title} - Starting nightly rate`,
      rate_status: 'active',
      currency: 'NGN',
      minimum_stay: 1,
      accommodation_type: { set: [accommodation.documentId] },
      season_prices: [{ priority: 0, base_price: room.price }],
    });
  }

  return {
    accommodations: rooms.length,
    rates: rooms.length,
    categories: categories.length,
    suggestedAmenities: suggestedAmenities.length,
    inventoryUnits: 0,
    reviews: 0,
    sampleBookings: 0,
  };
}

async function waitForDatabaseDrain(strapi, timeoutMs = 10000) {
  const pool = strapi.db.connection.client.pool;
  const deadline = Date.now() + timeoutMs;
  while (pool.numUsed() > 0 || pool.numPendingAcquires() > 0) {
    if (Date.now() >= deadline) throw new Error('Timed out waiting for seed database work to finish.');
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function main() {
  if (!process.env.DATABASE_NAME?.startsWith('royal_signature_')) {
    throw new Error('Refusing to seed without a dedicated Royal Signature database.');
  }
  process.env.CRON_ENABLED = 'false';
  const { createStrapi } = require('@strapi/strapi');
  const strapi = await createStrapi().load();
  try {
    const result = await seed(strapi);
    console.log(JSON.stringify({ message: 'Royal Signature seed completed', ...result }, null, 2));
  } finally {
    try {
      await waitForDatabaseDrain(strapi);
    } finally {
      await strapi.destroy();
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { seed, rooms, categories, suggestedAmenities };