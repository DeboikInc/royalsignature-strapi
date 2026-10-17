'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { checkAvailability, fetchAccommodationTypes, fetchRates } from '@/app/api';
import BookingSearch from './BookingSearch';

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export default function BookingResults() {
  const params = useSearchParams();
  const checkIn = params.get('check_in_date') || '';
  const checkOut = params.get('check_out_date') || '';
  const adults = params.get('adults') || '2';
  const children = params.get('children') || '0';
  const accommodationType = params.get('accommodation_type') || '';
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!checkIn || !checkOut) return;
    let active = true;
    setResults(null);
    setError('');
    Promise.all([
      checkAvailability({
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults: Number(adults),
        children: Number(children),
        ...(accommodationType ? { accommodation_type: Number(accommodationType) } : {}),
      }),
      fetchAccommodationTypes(),
    ]).then(([availability, rooms]) => {
      if (!active) return;
      setResults((availability.availability || []).map((item) => ({
        ...item,
        room: rooms.find((room) => room.id === item.accommodation_type),
      })).filter((item) => item.room));
    }).catch((requestError) => { if (active) setError(requestError.message || 'Availability could not be checked.'); });
    return () => { active = false; };
  }, [checkIn, checkOut, adults, children, accommodationType]);

  if (!checkIn || !checkOut) {
    return <section className="page-content"><div className="page-heading"><p className="eyebrow eyebrow-dark">Plan your stay</p><h1>Check availability</h1><p>Choose dates and guest counts to search confirmed room inventory.</p></div><BookingSearch accommodationTypeId={accommodationType} /></section>;
  }

  const nights = Math.max(0, Math.round((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000));
  return (
    <section className="page-content">
      <div className="page-heading"><p className="eyebrow eyebrow-dark">{checkIn} to {checkOut} · {nights} night{nights === 1 ? '' : 's'}</p><h1>Available stays</h1><p>{adults} adult{adults === '1' ? '' : 's'}{children !== '0' ? ` · ${children} child${children === '1' ? '' : 'ren'}` : ''}</p></div>
      {error && <div className="status-panel" role="alert"><p>{error}</p></div>}
      {!error && results === null && <p role="status">Checking live availability…</p>}
      {!error && results?.length === 0 && <div className="status-panel"><p>No bookable room inventory is currently configured for these dates. Please contact the hotel after contact details are confirmed.</p></div>}
      <div className="booking-results">
        {results?.map((item) => item.accommodations.map((unit) => {
          const stayTotal = Number(item.base_price);
          const nightlyEstimate = nights > 0 ? stayTotal / nights : stayTotal;
          const query = new URLSearchParams({
            rate_id: String(item.rate_id), accommodation_id: String(unit.id), apartment_id: String(item.accommodation_type),
            check_in: checkIn, check_out: checkOut, adults, children,
          });
          return (
            <article className="availability-card" key={`${item.rate_id}-${unit.id}`}>
              <div><h2>{item.room.title}</h2><p>{money.format(stayTotal)} total for {nights} night{nights === 1 ? '' : 's'} · {money.format(nightlyEstimate)} / night estimate · {unit.name}</p><p className="content-note">This server quote is checked again when the booking hold is created.</p></div>
              <Link className="button" href={`/checkout?${query}`}>Continue to booking <span aria-hidden="true">↗</span></Link>
            </article>
          );
        }))}
      </div>
      <p className="content-note">Availability is confirmed again when a temporary booking hold is created.</p>
    </section>
  );
}