import Link from 'next/link';
import { RiArrowRightLine, RiCupLine, RiHotelBedLine, RiMapPinLine } from 'react-icons/ri';
import BookingSearch from './BookingSearch';
import ReviewPreview from './ReviewPreview';
import RoomCatalog from './RoomCatalog';

const heroImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2200&q=88';

export default function RoyalHomepage() {
  return (
    <main>
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,19,31,.78), rgba(10,19,31,.20)), url(${heroImage})` }}>
        <div className="hero-content">
          <p className="eyebrow">Ojo's Epitome of Opulence &amp; Seclusion</p>
          <h1>Where Every<br />Stay Is Unique.</h1>
          <p className="hero-copy">A welcoming hospitality experience in Ojo, Lagos, centred on comfort, elegance and attentive service.</p>
          <div className="hero-actions">
            <Link href="/booking" className="button button-gold">Book your stay <RiArrowRightLine aria-hidden="true" /></Link>
            <Link href="/rooms" className="button button-outline">Explore rooms</Link>
          </div>
          <p className="photo-disclaimer">Illustrative photography. Royal Signature property images are pending.</p>
        </div>
        <div className="hero-location"><RiMapPinLine aria-hidden="true" /> Ojo Road · Lagos State</div>
      </section>

      <section className="booking-band" aria-label="Search availability">
        <div className="section-kicker">Plan your stay</div>
        <BookingSearch />
      </section>

      <section className="welcome section-wrap">
        <div className="welcome-copy">
          <p className="eyebrow eyebrow-dark">Welcome to Royal Signature</p>
          <h2>Comfort, considered.<br /><em>Hospitality, personal.</em></h2>
          <p>In the graceful city of Ojo, Lagos State, Royal Signature Hotel and Suites offers a welcoming hospitality experience centred on comfort, elegance, and attentive service.</p>
          <p>Located along Ojo Road, the hotel provides a setting for guests travelling for business, leisure, and special occasions. Our aim is to combine modern comfort, thoughtfully presented spaces, and warm hospitality to make every stay memorable.</p>
          <Link href="/about" className="text-link">Discover our story <RiArrowRightLine aria-hidden="true" /></Link>
        </div>
        <div className="welcome-image">
          <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=84" alt="Illustrative calm hotel interior" />
          <span>Illustrative photography</span>
        </div>
      </section>

      <section className="rooms-section section-wrap">
        <div className="section-heading">
          <div><p className="eyebrow eyebrow-dark">Stay your way</p><h2>Rooms &amp; suites</h2></div>
          <Link href="/rooms" className="text-link">Explore all rooms <RiArrowRightLine aria-hidden="true" /></Link>
        </div>
        <RoomCatalog featuredOnly />
        <p className="content-note">Prices shown are initial supplied starting rates and remain subject to confirmation.</p>
      </section>

      <section className="experience-band">
        <div className="section-wrap experience-inner">
          <div><p className="eyebrow">A stay shaped around you</p><h2>Make room for<br /><em>the moments that matter.</em></h2></div>
          <div className="experience-list">
            <Link href="/amenities"><RiHotelBedLine aria-hidden="true" /><span><strong>Rooms &amp; suites</strong><small>Explore your stay options</small></span><RiArrowRightLine aria-hidden="true" /></Link>
            <Link href="/dining"><RiCupLine aria-hidden="true" /><span><strong>Dining</strong><small>Details coming soon</small></span><RiArrowRightLine aria-hidden="true" /></Link>
            <Link href="/events"><span className="experience-letter" aria-hidden="true">E</span><span><strong>Events</strong><small>Facilities to be confirmed</small></span><RiArrowRightLine aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="reviews-section section-wrap">
        <div className="section-heading"><div><p className="eyebrow eyebrow-dark">From our guests</p><h2>Guest notes</h2></div><Link href="/reviews" className="text-link">All reviews <RiArrowRightLine aria-hidden="true" /></Link></div>
        <ReviewPreview />
      </section>

      <section className="closing-cta">
        <p className="eyebrow">Royal Signature Hotel and Suites · Ojo, Lagos</p>
        <h2>Your Ojo stay<br /><em>starts here.</em></h2>
        <Link href="/booking" className="button button-gold">Check availability <RiArrowRightLine aria-hidden="true" /></Link>
      </section>
    </main>
  );
}