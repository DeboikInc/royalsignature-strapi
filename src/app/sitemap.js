const routes = ['', '/about', '/rooms', '/amenities', '/dining', '/events', '/gallery', '/contact', '/reviews', '/faq', '/privacy-policy', '/terms'];

export default function sitemap() {
  const base = (process.env.APP_BASE_URL || 'https://royalssignaturehotelandsuites.com').replace(/\/$/, '');
  return routes.map((route) => ({ url: `${base}${route}`, changeFrequency: 'weekly', priority: route === '' ? 1 : 0.6 }));
}