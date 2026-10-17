export const metadata = { title: 'Frequently Asked Questions | Royal Signature Hotel and Suites', alternates: { canonical: '/faq' } };

const items = [
  ['Where is the hotel?', 'Royal Signature Hotel and Suites is located on Ojo Road, Ojo, Lagos State, Nigeria. Exact map coordinates are pending confirmation.'],
  ['How do I check availability?', 'Choose your dates and guest count on the booking page. Availability depends on individual room inventory being configured in the system.'],
  ['Are the displayed room prices final?', 'The listed prices are initial supplied starting rates. Confirm current rates, occupancy rules and any extra charges with the hotel before production.'],
  ['What amenities are available?', 'Room facilities, restaurant, lounge and event offerings are being confirmed. Only verified amenities will be published.'],
  ['How can I contact the hotel?', 'The hotel phone number and email address are pending confirmation.'],
  ['What are the cancellation terms?', 'Cancellation and refund terms have not yet been supplied by the hotel.'],
];

export default function FAQPage() {
  return <main><section className="page-hero"><div className="page-hero-inner"><p className="eyebrow">Helpful details</p><h1>Frequently asked questions</h1><p>Information will be updated as hotel policies are confirmed.</p></div></section><section className="page-content">{items.map(([question, answer]) => <article className="faq-item" key={question}><h2>{question}</h2><p>{answer}</p></article>)}</section></main>;
}