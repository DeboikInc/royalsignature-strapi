import { RiMailLine, RiMapPin2Line, RiPhoneLine } from 'react-icons/ri';

export const metadata = { title: 'Contact | Royal Signature Hotel and Suites', alternates: { canonical: '/contact' } };

export default function ContactPage() {
  return (
    <main>
      <section className="page-content contact-page-grid">
        <div className="contact-details">
          <h1>Get in Touch</h1>
          <div className="contact-detail">
            <span className="contact-detail-icon"><RiMapPin2Line aria-hidden="true" /></span>
            <div><h2>Our Location</h2>
            <p>Ojo Road, Ojo, Lagos State, Nigeria</p>
            </div>
          </div>
          <div className="contact-detail">
            <span className="contact-detail-icon"><RiPhoneLine aria-hidden="true" /></span>
            <div><h2>Call Us</h2>
            <p>Hotel phone number pending confirmation.</p>
            <small>Availability details will be provided by the hotel.</small>
            </div>
          </div>
          <div className="contact-detail">
            <span className="contact-detail-icon"><RiMailLine aria-hidden="true" /></span>
            <div><h2>Email Us</h2>
            <p>Hotel email address pending confirmation.</p>
            </div>
          </div>
          <div className="contact-office-hours">
            <h2>Office Hours</h2>
            <p>Front desk hours are pending confirmation.</p>
          </div>
        </div>
        <div className="contact-map-panel">
          <h2>Find Us on the Map</h2>
          <iframe
            title="Map of the Ojo Road area in Ojo, Lagos"
            src="https://www.google.com/maps?q=Ojo%2C%20Lagos%20State%2C%20Nigeria&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <p>This map shows the Ojo Road area, not a confirmed hotel pin.</p>
        </div>
      </section>
    </main>
  );
}