import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Flutterwave webhooks are disabled for this Paystack test-mode setup.' },
    { status: 410 }
  );
}
