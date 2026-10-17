export default function robots() {
  const base = process.env.APP_BASE_URL || 'https://royalssignaturehotelandsuites.com';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/checkout'] }],
    sitemap: `${base.replace(/\/$/, '')}/sitemap.xml`,
  };
}