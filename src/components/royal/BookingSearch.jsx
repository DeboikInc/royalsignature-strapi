'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiArrowRightLine, RiCalendarLine } from 'react-icons/ri';

function today() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function BookingSearch({ compact = false, accommodationTypeId = '' }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setError('Choose a check-out date after check-in.');
      return;
    }
    setError('');
    const query = new URLSearchParams({ check_in_date: checkIn, check_out_date: checkOut, adults, children });
    if (accommodationTypeId) query.set('accommodation_type', accommodationTypeId);
    router.push(`/booking?${query}`);
  }

  return (
    <form className={`booking-search ${compact ? 'booking-search-compact' : ''}`} onSubmit={submit}>
      <label>
        <span><RiCalendarLine aria-hidden="true" /> Check-in</span>
        <input required type="date" min={today()} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
      </label>
      <label>
        <span><RiCalendarLine aria-hidden="true" /> Check-out</span>
        <input required type="date" min={checkIn || today()} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
      </label>
      <label>
        <span>Adults</span>
        <select value={adults} onChange={(event) => setAdults(event.target.value)}>
          {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count}</option>)}
        </select>
      </label>
      <label>
        <span>Children</span>
        <select value={children} onChange={(event) => setChildren(event.target.value)}>
          {[0, 1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}</option>)}
        </select>
      </label>
      <button type="submit">Check availability <RiArrowRightLine aria-hidden="true" /></button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}