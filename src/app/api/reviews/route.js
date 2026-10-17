import { NextResponse } from "next/server";
import { strapiRequest } from '@/lib/strapiServer';

export async function GET(req) {
  try {
    const id = req.nextUrl.searchParams.get("id")
    const data = await strapiRequest(`reviews${id ? `?id=${encodeURIComponent(id)}` : ''}`);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Unable to load reviews' }, { status: error.status || 502 });
  }
}

export async function POST(req) {
  try {
    const accommodationReview = await req.json();
    const data = await strapiRequest('reviews', {
      method: 'POST',
      body: JSON.stringify(accommodationReview),
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Unable to submit review' }, { status: error.status || 502 });
  }
}
