import RoomCatalog from '@/components/royal/RoomCatalog';

export const metadata = { title: 'Rooms & Suites | Royal Signature Hotel and Suites', alternates: { canonical: '/rooms' } };

export default function RoomsPage() {
  return <main><section className="page-hero"><div className="page-hero-inner"><p className="eyebrow">Find your place in Ojo</p><h1>Rooms &amp; suites</h1><p>Explore published room details, real Royal Signature photography, and current starting rates.</p></div></section><section className="page-content"><RoomCatalog /></section></main>;
}