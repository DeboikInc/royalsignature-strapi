'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RiArrowLeftSLine, RiArrowRightSLine, RiArrowRightUpLine, RiHotelBedLine, RiUserLine } from 'react-icons/ri';
import { fetchAccommodationTypes, fetchRates } from '@/app/api';
import { getRoomPhoto } from '@/lib/roomMedia';
import BrandLoader from './BrandLoader';

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
const pageSize = 6;

function RoomCard({ room }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = room.cover_image?.src || room.images?.[0]?.src || getRoomPhoto(room.slug);

  return (
    <article className="room-card">
      <Link href={`/rooms/${room.slug}`} className="room-card-image" aria-label={`View ${room.title}`}>
        {image && !imageFailed ? (
          <img
            src={image}
            alt={`${room.title} at Royal Signature Hotel and Suites`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="room-image-placeholder">
            <RiHotelBedLine aria-hidden="true" />
            <span>Royal Signature</span>
          </span>
        )}
      </Link>
      <div className="room-card-body">
        <div className="room-card-heading">
          <h3><Link href={`/rooms/${room.slug}`}>{room.title}</Link></h3>
          {room.bed_type && <p>{room.bed_type}</p>}
        </div>
        <div className="room-card-meta">
          {Number.isFinite(room.capacity) && room.capacity > 0 && (
            <span><RiUserLine aria-hidden="true" /> Sleeps {room.capacity}</span>
          )}
          {room.property_type && <span>{room.property_type.replaceAll('-', ' ')}</span>}
        </div>
        <div className="room-card-bottom">
          <p>
            {room.price === null
              ? <strong>Rate pending</strong>
              : <><strong>{money.format(room.price)}</strong><span> / night, starting</span></>}
          </p>
          <Link href={`/rooms/${room.slug}`}>View room <RiArrowRightUpLine aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}

export default function RoomCatalog({ featuredOnly = false }) {
  const [rooms, setRooms] = useState([]);
  const [state, setState] = useState('loading');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedType: '',
    capacity: '',
    amenity: '',
    tag: '',
    sort: 'recommended',
  });

  useEffect(() => {
    let active = true;
    Promise.all([fetchAccommodationTypes(), fetchRates()])
      .then(([types, rates]) => {
        if (!active) return;
        const mapped = types.map((room) => {
          const rate = rates.find((item) => item.accommodation_type_id === room.id && item.rate_status === 'active');
          const price = Number(rate?.season_prices?.[0]?.base_price);
          return {
            ...room,
            rate,
            price: Number.isFinite(price) && price >= 0 ? price : null,
            capacity: Number(room.adults || 0) + Number(room.children || 0),
          };
        }).filter((room) => !featuredOnly || room.featured);
        setRooms(mapped);
        setState('ready');
      })
      .catch(() => {
        if (active) setState('unavailable');
      });
    return () => { active = false; };
  }, [featuredOnly]);

  const propertyTypes = useMemo(() => [...new Set(rooms.map((room) => room.property_type).filter(Boolean))].sort(), [rooms]);
  const bedTypes = useMemo(() => [...new Set(rooms.map((room) => room.bed_type).filter(Boolean))].sort(), [rooms]);
  const amenities = useMemo(
    () => [...new Set(rooms.flatMap((room) => room.amenities?.map((amenity) => amenity.name) || []).filter(Boolean))].sort(),
    [rooms]
  );
  const tags = useMemo(
    () => [...new Set(rooms.flatMap((room) => room.tags?.map((tag) => tag.name) || []).filter(Boolean))].sort(),
    [rooms]
  );
  const capacities = useMemo(
    () => [...new Set(rooms.map((room) => room.capacity).filter((capacity) => capacity > 0))].sort((first, second) => first - second),
    [rooms]
  );
  const prices = rooms.map((room) => room.price).filter((price) => price !== null);
  const minAvailablePrice = prices.length ? Math.min(...prices) : 0;
  const maxAvailablePrice = prices.length ? Math.max(...prices) : 0;

  const filteredRooms = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice);
    const capacity = Number(filters.capacity);
    const matches = rooms.filter((room) => {
      if (search && !`${room.title} ${room.description || ''} ${room.excerpt || ''}`.toLowerCase().includes(search)) return false;
      if (minPrice !== null && (room.price === null || room.price < minPrice)) return false;
      if (maxPrice !== null && (room.price === null || room.price > maxPrice)) return false;
      if (filters.propertyType && room.property_type !== filters.propertyType) return false;
      if (filters.bedType && room.bed_type !== filters.bedType) return false;
      if (capacity && room.capacity < capacity) return false;
      if (filters.amenity && !room.amenities?.some((amenity) => amenity.name === filters.amenity)) return false;
      if (filters.tag && !room.tags?.some((tag) => tag.name === filters.tag)) return false;
      return true;
    });

    return matches.sort((first, second) => {
      if (filters.sort === 'price-ascending') {
        return (first.price ?? Number.POSITIVE_INFINITY) - (second.price ?? Number.POSITIVE_INFINITY);
      }
      if (filters.sort === 'price-descending') {
        return (second.price ?? Number.NEGATIVE_INFINITY) - (first.price ?? Number.NEGATIVE_INFINITY);
      }
      if (filters.sort === 'name') return first.title.localeCompare(second.title);
      return first.id - second.id;
    });
  }, [filters, rooms]);

  useEffect(() => setPage(1), [filters]);

  if (state === 'loading') return <BrandLoader label="Loading rooms and current rates..." />;
  if (state === 'unavailable') {
    return <p className="catalog-note" role="alert">Room information is temporarily unavailable. Please check back shortly.</p>;
  }
  if (!rooms.length) return <p className="catalog-note">{featuredOnly ? 'No featured rooms are currently highlighted.' : 'No published room listings are currently available.'}</p>;

  const totalPages = Math.ceil(filteredRooms.length / pageSize);
  const visibleRooms = filteredRooms.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={`room-catalog${featuredOnly ? ' room-catalog--featured' : ''}`}>
      {!featuredOnly && (
        <aside className="room-catalog-sidebar">
          <section className="room-filters" aria-label="Filter rooms and suites">
            <div className="room-filters-heading">
              <div><h2>Find your stay</h2><p>Filters use published room details and active rates.</p></div>
              <button type="button" className="text-button" onClick={() => setFilters({
                search: '', minPrice: '', maxPrice: '', propertyType: '', bedType: '', capacity: '', amenity: '', tag: '', sort: 'recommended',
              })}>Clear filters</button>
            </div>
            <div className="room-filter-grid">
              <label className="room-filter-search">
                Search rooms
                <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Name or description" />
              </label>
              <label>
                Room type
                <select value={filters.propertyType} onChange={(event) => setFilters({ ...filters, propertyType: event.target.value })}>
                  <option value="">All room types</option>
                  {propertyTypes.map((type) => <option key={type} value={type}>{type.replaceAll('-', ' ')}</option>)}
                </select>
              </label>
              <label>
                Bed type
                <select value={filters.bedType} onChange={(event) => setFilters({ ...filters, bedType: event.target.value })}>
                  <option value="">Any bed type</option>
                  {bedTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>
                Guest capacity
                <select value={filters.capacity} onChange={(event) => setFilters({ ...filters, capacity: event.target.value })}>
                  <option value="">Any capacity</option>
                  {capacities.map((capacity) => <option key={capacity} value={capacity}>Sleeps {capacity} or more</option>)}
                </select>
              </label>
              {amenities.length > 0 && (
                <label>
                  Amenity
                  <select value={filters.amenity} onChange={(event) => setFilters({ ...filters, amenity: event.target.value })}>
                    <option value="">Any amenity</option>
                    {amenities.map((amenity) => <option key={amenity} value={amenity}>{amenity}</option>)}
                  </select>
                </label>
              )}
              {tags.length > 0 && (
                <label>
                  Collection
                  <select value={filters.tag} onChange={(event) => setFilters({ ...filters, tag: event.target.value })}>
                    <option value="">All collections</option>
                    {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
                </label>
              )}
              <label>
                Minimum nightly price (₦)
                <input
                  type="number"
                  min={minAvailablePrice}
                  max={maxAvailablePrice}
                  value={filters.minPrice}
                  onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
                  placeholder={String(minAvailablePrice)}
                />
              </label>
              <label>
                Maximum nightly price (₦)
                <input
                  type="number"
                  min={minAvailablePrice}
                  max={maxAvailablePrice}
                  value={filters.maxPrice}
                  onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
                  placeholder={String(maxAvailablePrice)}
                />
              </label>
              <label>
                Sort by
                <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
                  <option value="recommended">Recommended</option>
                  <option value="price-ascending">Price: low to high</option>
                  <option value="price-descending">Price: high to low</option>
                  <option value="name">Room name</option>
                </select>
              </label>
            </div>
          </section>
        </aside>
      )}

      <section className="room-catalog-results" aria-label="Rooms and suites">
        {!featuredOnly && (
          <div className="room-results-header">
            <p className="room-results-count" aria-live="polite">
              {filteredRooms.length} room{filteredRooms.length === 1 ? '' : 's'} found
            </p>
          </div>
        )}
        {filteredRooms.length === 0 ? (
          <div className="catalog-empty">
            <h2>No rooms match those filters</h2>
            <p>Try a different combination or clear the filters to see all published rooms.</p>
            <button className="button button-gold" type="button" onClick={() => setFilters({
              search: '', minPrice: '', maxPrice: '', propertyType: '', bedType: '', capacity: '', amenity: '', tag: '', sort: 'recommended',
            })}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="room-grid">
              {visibleRooms.map((room) => <RoomCard key={room.documentId || room.id} room={room} />)}
            </div>
            {!featuredOnly && totalPages > 1 && (
              <nav className="catalog-pagination" aria-label="Room listing pages">
                <button type="button" onClick={() => setPage(page - 1)} disabled={page === 1} aria-label="Previous page">
                  <RiArrowLeftSLine aria-hidden="true" /> Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" onClick={() => setPage(page + 1)} disabled={page === totalPages} aria-label="Next page">
                  Next <RiArrowRightSLine aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
