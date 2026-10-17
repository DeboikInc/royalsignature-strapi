const getBaseUrl = () => {
  const baseUrl = process.env.STRAPI_URL;
  if (!baseUrl) throw new Error('STRAPI_URL is not configured');
  let parsedUrl;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error('STRAPI_URL must be a valid absolute URL');
  }
  if (/viveeaura\.(com|org)$/i.test(parsedUrl.hostname)) {
    throw new Error('STRAPI_URL must point to the independent Royal Signature CMS');
  }
  return parsedUrl.toString().replace(/\/+$/, '').replace(/\/api$/, '');
};

export async function strapiRequest(path, options = {}) {
  const url = `${getBaseUrl()}/api/${path.replace(/^\/+/, '')}`;
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body) headers.set('Content-Type', 'application/json');
  if (options.protected) {
    if (!process.env.STRAPI_API_TOKEN) throw new Error('STRAPI_API_TOKEN is not configured');
    headers.set('Authorization', `Bearer ${process.env.STRAPI_API_TOKEN}`);
  }
  delete options.protected;

  const response = await fetch(url, { ...options, headers, cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error?.message || data?.error || data?.message || `Strapi request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export function fetchStrapiBooking(reference) {
  return strapiRequest(`bookings/${encodeURIComponent(reference)}`, { protected: true });
}

export function confirmStrapiBooking(reference, gateway, transactionReference, amount) {
  return strapiRequest(`bookings/${encodeURIComponent(reference)}/confirm`, {
    method: 'POST',
    protected: true,
    headers: { 'x-webhook-secret': process.env.INTERNAL_WEBHOOK_SECRET || '' },
    body: JSON.stringify({ gateway, tx_ref: transactionReference, amount }),
  });
}

export function recordStrapiPaymentAttempt(reference, gateway, transactionReference) {
  return strapiRequest(`bookings/${encodeURIComponent(reference)}/payment-attempt`, {
    method: 'POST',
    protected: true,
    headers: { 'x-webhook-secret': process.env.INTERNAL_WEBHOOK_SECRET || '' },
    body: JSON.stringify({ gateway, tx_ref: transactionReference }),
  });
}

export function recordStrapiPaymentState(reference, transactionReference, paymentStatus) {
  return strapiRequest(`bookings/${encodeURIComponent(reference)}/payment-state`, {
    method: 'POST',
    protected: true,
    headers: { 'x-webhook-secret': process.env.INTERNAL_WEBHOOK_SECRET || '' },
    body: JSON.stringify({ tx_ref: transactionReference, payment_status: paymentStatus }),
  });
}