'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAccommodationTypeBySlug, fetchRates } from '@/app/api';
import BookingSearch from './BookingSearch';

const placeholder = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=85';
const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export default function RoomDetails({ slug }) {
  const [room, setRoom] = useState(null);
  const [rate, setRate] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    Promise.all([fetchAccommodationTypeBySlug(slug), fetchRates()])
      .then(([accommodation, rates]) => {
        if (!active) return;
        setRoom(accommodation);
        setRate(rates.find((item) => item.accommodation_type_id === accommodation.id && item.rate_status === 'active') || null);
        setStatus('ready');
      })
      .catch(() => { if (active) setStatus('not-found'); });
    return () => { active = false; };
  }, [slug]);

  if (status === 'loading') return <main className="page-content"><p role="status">Loading room details…</p></main>;
  if (status === 'not-found' || !room) return <main className="page-content"><h1>Room not found</h1><p>This room may no longer be listed.</p><Link href="/rooms" className="text-link">Browse rooms</Link></main>;

  const hasHotelImages = Boolean(room.cover_image?.src || room.images?.length);
  const image = room.cover_image?.src || room.images?.[0]?.src || placeholder;
  const price = Number(rate?.season_prices?.[0]?.base_price);

  return (
    <main>
      <section className="room-detail-hero" style={{ backgroundImage: `linear-gradient(0deg, rgba(8,15,25,.68), transparent 65%), url(${image})` }}>
        <h1>{room.title}</h1>
      </section>
      <div className="room-detail-image-note page-content">{hasHotelImages ? 'Images supplied by Royal Signature.' : 'Illustrative photography. Room photographs are pending.'}</div>
      <section className="page-content room-detail-grid">
        <div>
          <p className="eyebrow eyebrow-dark">Rooms &amp; suites</p>
          <p>{room.description || 'Room description pending confirmation.'}</p>
          <h2>Stay details</h2>
          <ul>
            <li>Bed configuration: {room.bed_type || 'Pending confirmation'}</li>
            <li>Guest capacity: {room.adults ?? 'Pending'} adults{room.children ? ` and ${room.children} child${room.children === 1 ? '' : 'ren'}` : ''}; occupancy assumptions require hotel confirmation.</li>
            <li>Room size and additional inclusions: pending confirmation.</li>
          </ul>
          <h2>Room amenities</h2>
          {room.amenities?.length ? <ul>{room.amenities.map((amenity) => <li key={amenity.id}>{amenity.name}</li>)}</ul> : <p>Room facilities are being confirmed. No unverified amenities are listed.</p>}
          <h2>Check dates</h2>
          <BookingSearch compact accommodationTypeId={String(room.id)} />
        </div>
        <aside className="room-detail-aside">
          <p className="eyebrow eyebrow-dark">Starting nightly rate</p>
          {rate && Number.isFinite(price) ? <strong>{money.format(price)} <small>/ night</small></strong> : <strong>Rate pending</strong>}
          <p>Initial supplied price; confirm current rate and any additional charges with the hotel before production.</p>
          <Link href={`/booking?accommodation_type=${room.id}`} className="button">Check availability</Link>
          <p>Availability appears only after individual room inventory is configured in the booking system.</p>
        </aside>
      </section>
    </main>
  );
}