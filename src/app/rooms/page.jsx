import RoomCatalog from '@/components/royal/RoomCatalog';

export const metadata = { title: 'Rooms & Suites | Royal Signature Hotel and Suites', alternates: { canonical: '/rooms' } };

export default function RoomsPage() {
  return <main><section className="page-hero"><div className="page-hero-inner"><p className="eyebrow">Find your place in Ojo</p><h1>Rooms &amp; suites</h1><p>Explore the room types and starting rates supplied for Royal Signature Hotel and Suites.</p></div></section><section className="page-content"><RoomCatalog /><p className="content-note">Starting rates, capacities and other supplied details are subject to confirmation. Room inventory and approved photographs have not yet been added.</p></section></main>;
}