import { NextResponse } from 'next/server';
import { getMediaUrl } from '@/lib/media';
import { strapiRequest } from '@/lib/strapiServer';

const PUBLIC_PATHS = [
  /^accommodation-types$/,
  /^accommodation-types\/by-slug\/[a-z0-9-]+$/i,
  /^accommodation-types\/\d+$/,
  /^rates$/,
  /^rates\/\d+$/,
  /^services$/,
];
const PUBLIC_POST_PATHS = [/^availability\/check$/];
const PROTECTED_PATHS = [
  /^bookings$/,
  /^bookings\/[0-9a-f-]+$/i,
  /^bookings\/[0-9a-f-]+\/(?:confirm|payment-attempt|payment-state)$/i,
];
const QUERY_RULES = [
  { pattern: /^accommodation-types$|^rates$/, allowed: ['page', 'pageSize'] },
  { pattern: /^rates\/\d+$/, allowed: ['check_in_date', 'check_out_date'] },
  { pattern: /^services$/, allowed: ['page', 'pageSize', 'accommodationTypeId'] },
];

function validatedQuery(request, route) {
  const entries = [...request.nextUrl.searchParams.entries()];
  if (entries.length > 4 || new Set(entries.map(([key]) => key)).size !== entries.length) {
    throw Object.assign(new Error('Invalid query parameters'), { status: 400 });
  }
  const allowed = QUERY_RULES.find((rule) => rule.pattern.test(route))?.allowed || [];
  for (const [key, value] of entries) {
    if (!allowed.includes(key)) throw Object.assign(new Error('Unsupported query parameter'), { status: 400 });
    if (key === 'page' && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 500)) {
      throw Object.assign(new Error('Invalid page'), { status: 400 });
    }
    if (key === 'pageSize' && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 100)) {
      throw Object.assign(new Error('Invalid page size'), { status: 400 });
    }
    if (key === 'accommodationTypeId' && (!/^\d+$/.test(value) || Number(value) < 1)) {
      throw Object.assign(new Error('Invalid accommodation type'), { status: 400 });
    }
    if ((key === 'check_in_date' || key === 'check_out_date') && !isCalendarDate(value)) {
      throw Object.assign(new Error('Dates must use YYYY-MM-DD'), { status: 400 });
    }
  }
  const dates = Object.fromEntries(entries);
  if (dates.check_in_date && dates.check_out_date && dates.check_out_date <= dates.check_in_date) {
    throw Object.assign(new Error('Check-out must be after check-in'), { status: 400 });
  }
  return request.nextUrl.searchParams.toString();
}

function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function normalizeMedia(value) {
  if (Array.isArray(value)) return value.map(normalizeMedia);
  if (!value || typeof value !== 'object') return value;
  const normalized = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeMedia(item)]));
  if (typeof value.url === 'string') {
    normalized.src = value.url.startsWith('/') && !value.url.startsWith('/uploads/')
      ? value.url
      : getMediaUrl(value.url);
  }
  return normalized;
}

async function proxy(request, context) {
  try {
    const { path = [] } = await context.params;
    const route = path.join('/');
    const method = request.method;
    const isPublic = method === 'GET' && PUBLIC_PATHS.some((pattern) => pattern.test(route));
    const isPublicPost = method === 'POST' && PUBLIC_POST_PATHS.some((pattern) => pattern.test(route));
    const isProtected = PROTECTED_PATHS.some((pattern) => pattern.test(route)) && ['GET', 'POST'].includes(method);
    if (!isPublic && !isPublicPost && !isProtected) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const origin = request.headers.get('origin');
    if (origin && new URL(origin).origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'Cross-origin requests are not allowed' }, { status: 403 });
    }
    if (request.headers.get('sec-fetch-site') === 'cross-site') {
      return NextResponse.json({ error: 'Cross-origin requests are not allowed' }, { status: 403 });
    }

    const query = validatedQuery(request, route);
    let body;
    if (method === 'POST') {
      if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
        return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
      }
      body = await request.text();
      if (Buffer.byteLength(body, 'utf8') > 32768) {
        return NextResponse.json({ error: 'Request body is too large' }, { status: 413 });
      }
      let payload;
      try { payload = JSON.parse(body); } catch {
        return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
      }
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
      }
    }
    const data = await strapiRequest(`${route}${query ? `?${query}` : ''}`, {
      method,
      body,
      protected: isProtected,
      headers: /\/(?:confirm|payment-attempt|payment-state)$/.test(route) && request.headers.get('x-webhook-secret')
        ? { 'x-webhook-secret': request.headers.get('x-webhook-secret') }
        : {},
    });
    return NextResponse.json(normalizeMedia(data));
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Strapi request failed' },
      { status: error.status || (error.message?.includes('not configured') ? 503 : 502) }
    );
  }
}

export const GET = proxy;
export const POST = proxy;