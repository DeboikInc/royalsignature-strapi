'use strict';

const UID = 'api::accommodation-type.accommodation-type';

async function findPublishedAccommodationType(strapi, relation) {
  if (!relation?.documentId) return null;
  if (relation.publishedAt) return relation;
  return strapi.documents(UID).findOne({ documentId: relation.documentId, status: 'published' });
}

module.exports = { findPublishedAccommodationType };