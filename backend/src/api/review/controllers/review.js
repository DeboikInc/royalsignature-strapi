'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::review.review', ({ strapi }) => ({
  async findPublic(ctx) {
    const typeId = Number(ctx.query.id);
    const filters = { review_status: 'approved' };
    if (ctx.query.id && (!Number.isInteger(typeId) || typeId < 1)) return ctx.badRequest('Accommodation type id is invalid');
    if (Number.isInteger(typeId) && typeId > 0) filters.accommodation_type = { id: typeId };
    const page = Math.max(1, Number.parseInt(ctx.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(ctx.query.pageSize, 10) || 100));
    const [records, total] = await Promise.all([
      strapi.db.query('api::review.review').findMany({
        where: filters,
        populate: { accommodation_type: true },
        orderBy: { date: 'desc', id: 'desc' },
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      strapi.db.query('api::review.review').count({ where: filters }),
    ]);
    const data = records.map((record) => ({
      id: record.id,
      documentId: record.documentId,
      name: record.name,
      title: record.title,
      review: record.review,
      rating: record.rating,
      date: record.date,
      post_id: record.accommodation_type?.id ?? record.post_id,
      accommodation_type: record.accommodation_type
        ? {
            id: record.accommodation_type.id,
            documentId: record.accommodation_type.documentId,
            title: record.accommodation_type.title,
            slug: record.accommodation_type.slug,
          }
        : null,
    }));
    ctx.body = { success: true, data, meta: { pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total } } };
  },

  async createPublic(ctx) {
    const input = ctx.request.body || {};
    const rating = Number(input.rating);
    const postId = Number(input.post_id);
    const name = String(input.name || '').trim();
    const title = String(input.title || '').trim();
    const review = String(input.review || '').trim();
    const email = String(input.email || '').trim().toLowerCase();
    if (!name || !title || !review) {
      return ctx.badRequest('Name, title, and review are required');
    }
    if (name.length > 120 || title.length > 180 || review.length > 5000) {
      return ctx.badRequest('Name, title, or review exceeds the allowed length');
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return ctx.badRequest('Rating must be an integer from 1 to 5');
    if (email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) return ctx.badRequest('A valid email is required');
    if (!Number.isInteger(postId) || postId < 1) return ctx.badRequest('A valid accommodation type is required');

    const accommodationType = await strapi.db.query('api::accommodation-type.accommodation-type').findOne({
      where: { id: postId, publishedAt: { $notNull: true } },
    });
    if (!accommodationType) return ctx.badRequest('Accommodation type was not found');

    await strapi.db.query('api::review.review').create({
      data: {
        name,
        email,
        title,
        review,
        rating,
        post_id: postId,
        accommodation_type: postId,
        review_status: 'pending',
        date: new Date(),
      },
    });
    ctx.status = 201;
    ctx.body = { success: true, review_status: 'pending' };
  },
}));