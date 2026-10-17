'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { findPublishedAccommodationType } = require('../../../lib/publishedAccommodationType');

/** @param {any} media */
const mapMedia = (media) => {
  if (!media) return [];
  return (Array.isArray(media) ? media : [media]).map((item) => ({ ...item, src: item.url }));
};
/** @param {Record<string, any>} record */
const mapAccommodationType = (record) => ({
  ...record,
  cover_image: record.cover_image ? { ...record.cover_image, src: record.cover_image.url } : null,
  images: mapMedia(record.images?.length ? record.images : record.cover_image),
});
/**
 * @param {any} strapi
 * @param {Record<string, any>} record
 * @returns {Promise<Record<string, any>>}
 */
const mapRate = async (strapi, record) => {
  const accommodationType = await findPublishedAccommodationType(strapi, record.accommodation_type);
  return { ...record, accommodation_type: accommodationType, accommodation_type_id: accommodationType?.id ?? null };
};

const catalogPopulate = {
  cover_image: true,
  images: true,
  services: true,
  categories: true,
  tags: true,
  amenities: true,
};

/**
 * @param {any} strapi
 * @param {any} ctx
 * @param {string} uid
 * @param {any} where
 * @param {any} populate
 * @returns {Promise<{ data: Record<string, any>[], meta: Record<string, any> }>}
 */
const listPage = async (strapi, ctx, uid, where, populate) => {
  const page = Math.max(1, Number.parseInt(ctx.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(ctx.query.pageSize, 10) || 100));
  const [records, total] = await Promise.all([
    strapi.db.query(uid).findMany({ where, populate, orderBy: { id: 'asc' }, limit: pageSize, offset: (page - 1) * pageSize }),
    strapi.db.query(uid).count({ where }),
  ]);
  return {
    data: records,
    meta: { pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total } },
  };
};

module.exports = createCoreController('api::accommodation-type.accommodation-type', ({ strapi }) => ({
  async accommodationTypes(ctx) {
    const result = await listPage(strapi, ctx, 'api::accommodation-type.accommodation-type', { publishedAt: { $notNull: true } }, catalogPopulate);
    ctx.body = { ...result, data: result.data.map(mapAccommodationType) };
  },

  async accommodationType(ctx) {
    const record = await strapi.db.query('api::accommodation-type.accommodation-type').findOne({
      where: { id: Number(ctx.params.id) },
      populate: catalogPopulate,
    });
    if (!record || !record.publishedAt) return ctx.notFound('Accommodation type not found');
    ctx.body = mapAccommodationType(record);
  },

  async accommodationTypeBySlug(ctx) {
    const record = await strapi.db.query('api::accommodation-type.accommodation-type').findOne({
      where: { slug: ctx.params.slug, publishedAt: { $notNull: true } },
      populate: catalogPopulate,
    });
    if (!record) return ctx.notFound('Accommodation type not found');
    ctx.body = mapAccommodationType(record);
  },

  async rates(ctx) {
    const result = await listPage(
      strapi,
      ctx,
      'api::rate.rate',
      { rate_status: 'active' },
      { accommodation_type: true, season_prices: { populate: { season: true } } }
    );
    ctx.body = { ...result, data: await Promise.all(result.data.map((record) => mapRate(strapi, record))) };
  },

  async rate(ctx) {
    const record = await strapi.db.query('api::rate.rate').findOne({
      where: { id: Number(ctx.params.id), rate_status: 'active' },
      populate: { accommodation_type: true, season_prices: { populate: { season: true } } },
    });
    if (!record) return ctx.notFound('Rate not found');
    if (ctx.query.check_in_date || ctx.query.check_out_date) {
      const bookingService = strapi.service('api::booking.booking');
      const dates = bookingService.getDates(ctx.query.check_in_date, ctx.query.check_out_date);
      if (!dates) return ctx.badRequest('A valid check-in and check-out date range is required');
      const total = bookingService.quotePrice(record, dates);
      if (total === null) return ctx.badRequest('No configured seasonal price covers the selected dates');
      ctx.body = { ...(await mapRate(strapi, record)), quote: { total, nights: dates.nights } };
      return;
    }
    ctx.body = await mapRate(strapi, record);
  },

  async services(ctx) {
    const typeId = Number(ctx.query.accommodationTypeId);
    const where = typeId ? { accommodation_types: { id: typeId } } : {};
    ctx.body = await listPage(strapi, ctx, 'api::service.service', where);
  },
}));