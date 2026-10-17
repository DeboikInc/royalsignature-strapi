import Link from 'next/link';
import BrandMark from './BrandMark';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <BrandMark light />
          <p>Where Every Stay Is Unique.</p>
          <p>Ojo Road, Ojo, Lagos State, Nigeria</p>
        </div>
        <div>
          <h2>Discover</h2>
          <Link href="/about">About the hotel</Link>
          <Link href="/rooms">Rooms &amp; suites</Link>
          <Link href="/amenities">Amenities</Link>
          <Link href="/gallery">Gallery</Link>
        </div>
        <div>
          <h2>Plan your stay</h2>
          <Link href="/dining">Dining</Link>
          <Link href="/events">Events</Link>
          <Link href="/faq">Frequently asked questions</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h2>Information</h2>
          <Link href="/reviews">Guest reviews</Link>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/terms">Terms &amp; conditions</Link>
          <p className="footer-pending">Phone, email and social links pending confirmation</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Royal Signature Hotel and Suites</span>
        <span>Rates and guest details are subject to hotel confirmation.</span>
      </div>
    </footer>
  );
}