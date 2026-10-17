// pages/api/paystack/initialize.ts
import fetch from 'cross-fetch';
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { fetchStrapiBooking, recordStrapiPaymentAttempt, recordStrapiPaymentState } from '@/lib/strapiServer';
import paystackSecurity from '@/lib/paystackSecurity.cjs';

export async function POST(req) {
  try {
    const bookingInfo = await req.json()
    let appBaseUrl;
    try {
      appBaseUrl = new URL(process.env.APP_BASE_URL || '');
    } catch {
      return NextResponse.json({ error: 'APP_BASE_URL must be configured as the Royal Signature application URL' }, { status: 503 });
    }
    if (/viveeaura\.(com|org)$/i.test(appBaseUrl.hostname)) {
      return NextResponse.json({ error: 'APP_BASE_URL must be the Royal Signature application URL' }, { status: 503 });
    }
    const { publicKey, secretKey } = paystackSecurity.getPaystackTestConfig();

    const id = bookingInfo?.bookingIntent?.id;
    if (!id) return NextResponse.json({ error: 'Booking is required' }, { status: 400 });
    const booking = await fetchStrapiBooking(id);
    if (booking.status !== 'pending-payment') return NextResponse.json({ error: 'Booking is not awaiting payment' }, { status: 409 });
    if (!booking.expires_at || new Date(booking.expires_at).valueOf() <= Date.now()) return NextResponse.json({ error: 'Booking payment hold has expired' }, { status: 409 });
    const total_price = Number(booking.total_price);
    const currency = booking.currency;
    const email = booking.customer?.email;
    const first_name = booking.customer?.first_name;
    const last_name = booking.customer?.last_name;
    const phone = booking.customer?.phone;
    if (!Number.isFinite(total_price) || total_price <= 0 || !email) return NextResponse.json({ error: 'Booking payment details are invalid' }, { status: 400 });

    const reference = `bk_${id}_${uuid()}`;
    const amountKobo = Math.round(total_price * 100);
    await recordStrapiPaymentAttempt(id, 'paystack', reference);

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name,
        last_name,
        phone,
        amount: amountKobo,
        currency: currency || 'NGN',
        reference,
        metadata: { id },
        callback_url: `${appBaseUrl.toString().replace(/\/$/, '')}?bookingId=${encodeURIComponent(id)}&ref=${reference}&gw=paystack`,
      }),
    });

    const data = await initRes.json();

    if (!data.status) {
      await recordStrapiPaymentState(id, reference, 'failed');
      return NextResponse.json({ error: data?.message || 'Paystack init failed' }, { status: 400 });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference,
      public_key: publicKey,
    }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}
