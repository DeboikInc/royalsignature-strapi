import ContactForm from '@/components/royal/ContactForm';

export const metadata = { title: 'Contact | Royal Signature Hotel and Suites', alternates: { canonical: '/contact' } };

export default function ContactPage() {
  return <main><section className="page-hero"><div className="page-hero-inner"><p className="eyebrow">We are in Ojo</p><h1>Get in touch</h1><p>We look forward to hearing from you.</p></div></section><section className="page-content"><div className="room-detail-grid"><div><h2>Visit us</h2><p>Ojo Road, Ojo, Lagos State, Nigeria</p><p>Phone and email: pending confirmation.</p><p>Front desk operating hours: pending confirmation.</p><p>Exact map coordinates have not been confirmed, so a map pin is not shown.</p></div><div><h2>Send an enquiry</h2><ContactForm /></div></div></section></main>;
}