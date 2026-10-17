import { NextResponse } from "next/server";
import { strapiRequest } from '@/lib/strapiServer';
import { isSameOriginRequest, readJsonObject } from '@/lib/sameOriginRequest';

export async function GET(req) {
  try {
    const entries = [...req.nextUrl.searchParams.entries()];
    const allowed = new Set(['id', 'page', 'pageSize']);
    if (entries.length > 3 || new Set(entries.map(([key]) => key)).size !== entries.length
      || entries.some(([key]) => !allowed.has(key))) {
      return NextResponse.json({ error: 'Invalid review query parameters' }, { status: 400 });
    }
    const params = new URLSearchParams(entries);
    for (const [key, value] of entries) {
      const maximum = key === 'pageSize' ? 100 : Number.MAX_SAFE_INTEGER;
      if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > maximum) {
        return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 });
      }
    }
    const query = params.toString();
    const data = await strapiRequest(`reviews${query ? `?${query}` : ''}`);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to load reviews' }, { status: error.status || 502 });
  }
}

export async function POST(req) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed' }, { status: 403 });
  }
  const parsed = await readJsonObject(req);
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: parsed.status });

  try {
    const data = await strapiRequest('reviews', {
      method: 'POST',
      body: JSON.stringify(parsed.value),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to submit review' }, { status: error.status || 502 });
  }
}
