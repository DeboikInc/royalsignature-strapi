'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAccommodationTypes, fetchRates } from '@/app/api';

const fallbackImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1100&q=82';
const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export default function RoomCatalog({ featuredOnly = false }) {
  const [rooms, setRooms] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let active = true;
    Promise.all([fetchAccommodationTypes(), fetchRates()])
      .then(([types, rates]) => {
        if (!active) return;
        const mapped = types.map((room) => {
          const rate = rates.find((item) => item.accommodation_type_id === room.id && item.rate_status === 'active');
          return { ...room, rate, image: room.cover_image?.src || room.images?.[0]?.src || fallbackImage };
        }).filter((room) => room.rate && (!featuredOnly || room.featured));
        setRooms(mapped);
        setState('ready');
      })
      .catch(() => { if (active) setState('unavailable'); });
    return () => { active = false; };
  }, [featuredOnly]);

  if (state === 'loading') return <p className="catalog-note" role="status">Loading rooms and current rates…</p>;
  if (state === 'unavailable') return <p className="catalog-note">Room information is temporarily unavailable. Please check back shortly.</p>;
  if (!rooms.length) return <p className="catalog-note">Room listings will appear here when the Royal Signature CMS is configured.</p>;

  return (
    <div className="room-grid">
      {rooms.map((room) => {
        const price = Number(room.rate.season_prices?.[0]?.base_price);
        return (
          <article className="room-card" key={room.slug}>
            <Link href={`/rooms/${room.slug}`} className="room-card-image">
              <img src={room.image} alt={room.cover_image || room.images?.length ? `${room.title} at Royal Signature` : `Illustrative room photograph for ${room.title}`} />
              {!room.cover_image && !room.images?.length && <span className="image-caption">Illustrative photography</span>}
            </Link>
            <div className="room-card-body">
              <div className="room-card-heading">
                <h3><Link href={`/rooms/${room.slug}`}>{room.title}</Link></h3>
                <p>{room.bed_type || 'Bed details pending confirmation'}</p>
              </div>
              <div className="room-card-bottom">
                <p><strong>{money.format(price)}</strong><span> / night, starting</span></p>
                <Link href={`/rooms/${room.slug}`} aria-label={`View ${room.title}`}>View room <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}