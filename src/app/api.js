export { getMediaUrl } from '@/lib/media';

async function request(url, options = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${response.status})`);
  }

  return data;
}

const getList = async (url) => {
  const records = [];
  let page = 1;
  let pageCount = 1;
  do {
    const separator = url.includes('?') ? '&' : '?';
    const data = await request(`${url}${separator}page=${page}&pageSize=100`);
    const rows = Array.isArray(data) ? data : data?.data ?? [];
    if (!Array.isArray(rows)) throw new Error('Unexpected list response');
    records.push(...rows);
    pageCount = Number(data?.meta?.pagination?.pageCount) || (rows.length === 100 ? page + 1 : page);
    page += 1;
  } while (page <= pageCount && page <= 500);
  return records;
};

export async function fetchRates() {
  return getList('/api/cms/rates');
}

export async function fetchAccommodationTypes() {
  return getList('/api/cms/accommodation-types');
}

export async function fetchRateById(id) {
  const query = new URLSearchParams();
  if (typeof window !== 'undefined') {
    const current = new URLSearchParams(window.location.search);
    const checkIn = current.get('check_in');
    const checkOut = current.get('check_out');
    if (checkIn && checkOut) {
      query.set('check_in_date', checkIn);
      query.set('check_out_date', checkOut);
    }
  }
  const suffix = query.size ? `?${query}` : '';
  const rate = await request(`/api/cms/rates/${encodeURIComponent(id)}${suffix}`);
  if (rate?.quote?.nights > 0 && Number.isFinite(Number(rate.quote.total))) {
    const existing = rate.season_prices?.[0] || {};
    rate.season_prices = [{ ...existing, base_price: Number(rate.quote.total) / rate.quote.nights }];
  }
  return rate;
}

export async function fetchAccommodationTypeById(id) {
  return request(`/api/cms/accommodation-types/${encodeURIComponent(id)}`);
}

export async function fetchAccommodationTypeBySlug(slug) {
  return request(`/api/cms/accommodation-types/by-slug/${encodeURIComponent(slug)}`)
}

export async function fetchReviews(accommodationTypeId = null) {
  const reviews = [];
  let page = 1;
  let pageCount = 1;
  do {
    const query = new URLSearchParams({ page: String(page), pageSize: '100' });
    if (accommodationTypeId) query.set('id', accommodationTypeId);
    const response = await request(`/api/reviews?${query}`);
    if (!Array.isArray(response?.data)) throw new Error('Unexpected reviews response');
    reviews.push(...response.data);
    pageCount = Number(response?.meta?.pagination?.pageCount) || (response.data.length === 100 ? page + 1 : page);
    page += 1;
  } while (page <= pageCount && page <= 500);
  return { success: true, data: reviews };
}

export async function postReview(reviewData) {
  return request('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  });
}

export async function checkAvailability(availabilityData) {
  return request('/api/cms/availability/check', {
    method: 'POST',
    body: JSON.stringify(availabilityData),
  });
}

export async function fetchAccommodationServices(accommodationTypeId) {
  const query = accommodationTypeId ? `?accommodationTypeId=${encodeURIComponent(accommodationTypeId)}` : '';
  return getList(`/api/cms/services${query}`);
}

export async function createBooking(bookingData) {
  const rateId = typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get('rate_id');
  let idempotencyKey = null;
  if (typeof window !== 'undefined') {
    idempotencyKey = window.sessionStorage.getItem('booking-idempotency-key');
    if (!idempotencyKey) {
      idempotencyKey = window.crypto.randomUUID();
      window.sessionStorage.setItem('booking-idempotency-key', idempotencyKey);
    }
  }
  const booking = await request('/api/cms/bookings', {
    method: 'POST',
    body: JSON.stringify({ ...bookingData, rate_id: rateId, idempotency_key: idempotencyKey }),
  });

  if (typeof window !== 'undefined' && booking?.id) {
    window.localStorage.setItem('bookingId', booking.id);
    window.sessionStorage.removeItem('booking-idempotency-key');
  }
  return booking;
}

export async function fetchBooking(bookingId) {
  return request(`/api/cms/bookings/${encodeURIComponent(bookingId)}`);
}

export async function payWithFlutterwave(bookingInfo) {
  const res = await fetch('/api/flutterwave/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingInfo),
  });
  return await res.json();
}

export async function payWithPaystack(bookingInfo) {
  const res = await fetch('/api/paystack/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingInfo),
  });
  return await res.json();
}