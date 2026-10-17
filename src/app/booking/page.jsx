import BookingResults from '@/components/royal/BookingResults';

export const metadata = { title: 'Book Your Stay | Royal Signature Hotel and Suites', alternates: { canonical: '/booking' } };

export default function BookingPage() {
  return <main><section className="page-hero"><div className="page-hero-inner"><p className="eyebrow">A stay in Ojo, Lagos</p><h1>Book your stay</h1><p>Search live availability and continue to the secure booking flow.</p></div></section><BookingResults /></main>;
}