// pages/api/paystack/webhook.ts
import { NextResponse } from 'next/server';
import { confirmStrapiBooking, fetchStrapiBooking, recordStrapiPaymentState } from '@/lib/strapiServer';
import paystackSecurity from '@/lib/paystackSecurity.cjs';

export const config = { api: { bodyParser: false } }; // raw body for signature

export async function POST(req) {
  try {
    const { secretKey } = paystackSecurity.getPaystackTestConfig();
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    if (!paystackSecurity.verifyWebhookSignature(secretKey, rawBody, signature)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid signature' },
        { status: 401 }
      );
    }

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }
    if (!['charge.success', 'charge.failed', 'charge.abandoned'].includes(event.event)) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const bookingId = event.data?.metadata?.id;
    const reference = event.data?.reference;
    if (!bookingId || !reference) return NextResponse.json({ error: 'Missing booking or payment reference' }, { status: 400 });

    const booking = await fetchStrapiBooking(bookingId);
    if (booking.status === 'confirmed' && booking.payment_reference === reference) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    if (booking.status !== 'pending-payment' || booking.payment_reference !== reference) {
      return NextResponse.json({ received: true, ignored: 'stale_payment_attempt' });
    }

    const verificationResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const verification = await verificationResponse.json();
    if (!verificationResponse.ok || !verification?.status) {
      return NextResponse.json({ error: 'Paystack transaction verification failed' }, { status: 502 });
    }

    const transaction = verification.data;
    const paymentStatus = paystackSecurity.classifyTransaction(transaction?.status);
    if (!paymentStatus) return NextResponse.json({ received: true, ignored: 'unsupported_transaction_state' });
    if (paymentStatus === 'succeeded') {
      if (!paystackSecurity.validateVerifiedTransaction(booking, transaction, reference)) {
        return NextResponse.json({ error: 'Verified payment does not match the booking' }, { status: 400 });
      }
      await confirmStrapiBooking(bookingId, 'paystack', reference, Number(transaction.amount) / 100);
    } else {
      await recordStrapiPaymentState(bookingId, reference, paymentStatus);
    }

    return NextResponse.json({ received: true, payment_status: paymentStatus });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: error.status || 500 }
    );
  }
}

