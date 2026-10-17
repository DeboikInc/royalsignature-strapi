'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiHotelBedLine,
  RiMapPin2Line,
} from 'react-icons/ri';
import { fetchAccommodationTypeBySlug, fetchRates, fetchReviews } from '@/app/api';
import { getRoomPhoto } from '@/lib/roomMedia';
import BookingSearch from './BookingSearch';
import BrandLoader from './BrandLoader';

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
const tabs = ['Overview', 'Reviews', 'Pricing', 'Policies', 'Contact Sales'];

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? ''
    : new Intl.DateTimeFormat('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function RoomPhoto({ image, title, onClick }) {
  return (
    <button type="button" className="room-photo-thumb" onClick={onClick} aria-label={`View ${title} photo`}>
      <img src={image.src} alt={`${title} room view`} loading="lazy" />
    </button>
  );
}

export default function RoomDetails({ slug }) {
  const [room, setRoom] = useState(null);
  const [rate, setRate] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsError, setReviewsError] = useState('');
  const [status, setStatus] = useState('loading');
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchAccommodationTypeBySlug(slug), fetchRates()])
      .then(async ([accommodation, rates]) => {
        if (!active) return;
        setRoom(accommodation);
        setRate(rates.find((item) => item.accommodation_type_id === accommodation.id && item.rate_status === 'active') || null);
        try {
          const result = await fetchReviews(accommodation.id);
          if (active) setReviews(result.data);
        } catch (error) {
          if (active) setReviewsError(error.message || 'Guest reviews are temporarily unavailable.');
        }
        if (active) setStatus('ready');
      })
      .catch((error) => {
        if (active) setStatus(error.status === 404 ? 'not-found' : 'unavailable');
      });
    return () => { active = false; };
  }, [slug]);

  const galleryImages = useMemo(() => {
    if (!room) return [];
    const images = [room.cover_image, ...(room.images || [])]
      .filter((item) => item?.src)
      .filter((item, index, images) => images.findIndex((candidate) => (candidate.url || candidate.src) === (item.url || item.src)) === index);
    if (images.length) return images;
    const roomPhoto = getRoomPhoto(room.slug);
    return roomPhoto ? [{ src: roomPhoto, url: roomPhoto }] : [];
  }, [room]);

  useEffect(() => {
    if (!viewerOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') setViewerOpen(false);
      if (event.key === 'ArrowRight') setSelectedImage((index) => (index + 1) % galleryImages.length);
      if (event.key === 'ArrowLeft') setSelectedImage((index) => (index - 1 + galleryImages.length) % galleryImages.length);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [galleryImages.length, viewerOpen]);

  if (status === 'loading') return <BrandLoader label="Loading room details..." />;
  if (status === 'unavailable') return <main className="page-content"><div className="status-panel" role="alert"><h1>Room details are temporarily unavailable</h1><p>Please try again shortly.</p><Link href="/rooms" className="text-link">Browse rooms</Link></div></main>;
  if (status === 'not-found' || !room) return <main className="page-content"><h1>Room not found</h1><p>This room may no longer be listed.</p><Link href="/rooms" className="text-link">Browse rooms</Link></main>;

  const price = Number(rate?.season_prices?.[0]?.base_price);
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;
  const location = [room.city, room.state].filter(Boolean).join(', ');

  return (
    <main className="room-detail-page">
      <section className="room-detail-overview">
        <div className="room-detail-inner">
          <header className="room-detail-heading">
            <h1>{room.title}</h1>
            <div className="room-detail-rating">
              <span aria-label={`${average.toFixed(1)} out of 5 stars`}>{'★'.repeat(Math.round(average)) || '☆☆☆☆☆'}</span>
              {reviewsError
                ? <span>Reviews temporarily unavailable</span>
                : <a href="#room-reviews">{average.toFixed(1)} ({reviews.length} review{reviews.length === 1 ? '' : 's'})</a>}
              {(location || room.address_line1) && <span className="room-detail-location"><RiMapPin2Line aria-hidden="true" />{[room.address_line1, location].filter(Boolean).join(', ')}</span>}
            </div>
          </header>

          <section className="room-photo-gallery" aria-label={`${room.title} photo gallery`}>
            <div className="room-photo-main">
              {galleryImages.length
                ? <img src={galleryImages[selectedImage]?.src} alt={`${room.title} at Royal Signature Hotel and Suites`} />
                : <div className="room-photo-placeholder"><RiHotelBedLine aria-hidden="true" /><span>Room photos coming soon</span></div>}
              {galleryImages.length > 0 && (
                <button className="room-photo-view-all" type="button" onClick={() => setViewerOpen(true)}>
                  View all photos
                </button>
              )}
            </div>
            <div className="room-photo-thumbnails">
              {galleryImages.slice(1, 3).map((image, index) => (
                <RoomPhoto
                  key={image.id || image.url || image.src}
                  image={image}
                  title={room.title}
                  onClick={() => setSelectedImage(index + 1)}
                />
              ))}
              {galleryImages.length === 0 && <p>Hotel photographs will appear here when supplied.</p>}
              {galleryImages.length === 1 && <div className="room-photo-more">More photos coming soon</div>}
            </div>
          </section>

          <div className="room-detail-content-grid">
            <div className="room-detail-main">
              <div className="room-detail-tabs" role="tablist" aria-label="Room details">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    role="tab"
                    id={`room-tab-${tab.toLowerCase().replaceAll(' ', '-')}`}
                    aria-selected={activeTab === tab}
                    aria-controls="room-tab-panel"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <section className="room-tab-panel" role="tabpanel" id="room-tab-panel" aria-labelledby={`room-tab-${activeTab.toLowerCase().replaceAll(' ', '-')}`}>
                {activeTab === 'Overview' && (
                  <>
                    <h2>About this room</h2>
                    <p>{room.description || room.excerpt || 'Room details will be added by the hotel.'}</p>
                    <h3>Room details</h3>
                    <ul className="room-facts">
                      {room.bed_type && <li><strong>Bed type</strong><span>{room.bed_type}</span></li>}
                      {room.size && <li><strong>Room size</strong><span>{room.size} m²</span></li>}
                      {room.bedrooms !== null && room.bedrooms !== undefined && <li><strong>Bedrooms</strong><span>{room.bedrooms}</span></li>}
                      {room.bathrooms !== null && room.bathrooms !== undefined && <li><strong>Bathrooms</strong><span>{room.bathrooms}</span></li>}
                      {(room.adults || room.children) && <li><strong>Capacity</strong><span>{room.adults || 0} adults{room.children ? `, ${room.children} children` : ''}</span></li>}
                    </ul>
                    {room.amenities?.length > 0 && (
                      <>
                        <h3>Amenities</h3>
                        <ul className="room-amenity-list">{room.amenities.map((amenity) => <li key={amenity.id}>{amenity.name}</li>)}</ul>
                      </>
                    )}
                  </>
                )}
                {activeTab === 'Reviews' && (
                  <div id="room-reviews">
                    <h2>Guest Reviews</h2>
                    {reviewsError ? <p className="room-tab-message" role="alert">{reviewsError}</p> : reviews.length ? reviews.map((review) => (
                      <article className="room-detail-review" key={review.documentId || review.id}>
                        <div><strong>{review.name}</strong><span>{'★'.repeat(Number(review.rating) || 0)}</span></div>
                        {formatDate(review.date) && <time dateTime={review.date}>{formatDate(review.date)}</time>}
                        {review.title && <h3>{review.title}</h3>}
                        <p>{review.review}</p>
                      </article>
                    )) : <p className="room-tab-message">No approved reviews for this room yet.</p>}
                    <Link href="/reviews#write-review" className="room-detail-action-link">Write a review</Link>
                  </div>
                )}
                {activeTab === 'Pricing' && (
                  <>
                    <h2>Pricing</h2>
                    <p>{rate && Number.isFinite(price) ? `${money.format(price)} per night, starting.` : 'A current rate has not been published for this room.'}</p>
                    {rate?.description && <p>{rate.description}</p>}
                    <p>Final totals depend on selected dates, occupancy, and any available seasonal pricing.</p>
                  </>
                )}
                {activeTab === 'Policies' && (
                  <>
                    <h2>Booking Policies</h2>
                    {room.cancellation_policy && <><h3>Cancellation Policy</h3><p>{room.cancellation_policy}</p></>}
                    {room.check_in_instructions && <><h3>Check-in</h3><p>{room.check_in_instructions}</p></>}
                    {room.check_out_instructions && <><h3>Check-out</h3><p>{room.check_out_instructions}</p></>}
                    {room.house_rules && <><h3>House Rules</h3><p>{room.house_rules}</p></>}
                    {!room.cancellation_policy && !room.check_in_instructions && !room.check_out_instructions && !room.house_rules
                      && <p>Booking policies will be provided by the hotel.</p>}
                  </>
                )}
                {activeTab === 'Contact Sales' && (
                  <>
                    <h2>Contact the hotel</h2>
                    <p>For questions about this room or a booking, contact the hotel team.</p>
                    <Link href="/contact" className="room-detail-action-link">View contact information</Link>
                  </>
                )}
              </section>
            </div>

            <aside className="room-booking-card">
              <p className="room-booking-price">
                {rate && Number.isFinite(price) ? money.format(price) : 'Rate pending'}
                {rate && Number.isFinite(price) && <small> / night</small>}
              </p>
              <p className="room-booking-reviews"><span>{'★'.repeat(Math.round(average)) || '☆☆☆☆☆'}</span> {average.toFixed(1)} ({reviews.length} review{reviews.length === 1 ? '' : 's'})</p>
              <BookingSearch compact accommodationTypeId={String(room.id)} />
              <p className="room-booking-note">You won't be charged yet.</p>
            </aside>
          </div>
        </div>
      </section>

      {viewerOpen && galleryImages.length > 0 && (
        <div className="room-photo-viewer" role="dialog" aria-modal="true" aria-label={`${room.title} photos`} onClick={() => setViewerOpen(false)}>
          <button type="button" className="room-photo-viewer-close" aria-label="Close photo gallery" onClick={() => setViewerOpen(false)}><RiCloseLine /></button>
          <button type="button" className="room-photo-viewer-arrow" aria-label="Previous photo" onClick={(event) => { event.stopPropagation(); setSelectedImage((selectedImage - 1 + galleryImages.length) % galleryImages.length); }}><RiArrowLeftSLine /></button>
          <img src={galleryImages[selectedImage]?.src} alt={`${room.title} photo ${selectedImage + 1}`} onClick={(event) => event.stopPropagation()} />
          <button type="button" className="room-photo-viewer-arrow" aria-label="Next photo" onClick={(event) => { event.stopPropagation(); setSelectedImage((selectedImage + 1) % galleryImages.length); }}><RiArrowRightSLine /></button>
          <p>{selectedImage + 1} / {galleryImages.length}</p>
        </div>
      )}
    </main>
  );
}
