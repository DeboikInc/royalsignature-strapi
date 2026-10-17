import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Flutterwave is disabled. Local checkout is configured for Paystack test mode only.' },
    { status: 410 }
  );
}
