export function getMediaUrl(path) {
  if (!path) return '/preview.jpg';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('//')) return `https:${path}`;

  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL || process.env.STRAPI_URL || '';
  if (!baseUrl) return path;
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}