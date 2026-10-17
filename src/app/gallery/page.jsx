export const metadata = { title: 'Gallery | Royal Signature Hotel and Suites', alternates: { canonical: '/gallery' } };

const photos = [
  { src: '/media/rooms/classic-room.webp', alt: 'Classic room interior at Royal Signature Hotel and Suites', caption: 'Classic Room' },
  { src: '/media/rooms/executive-room.webp', alt: 'Executive room interior at Royal Signature Hotel and Suites', caption: 'Executive Room' },
  { src: '/media/rooms/deluxe-room.webp', alt: 'Deluxe room interior at Royal Signature Hotel and Suites', caption: 'Deluxe Room' },
  { src: '/media/rooms/super-royal.webp', alt: 'Super Royal room interior at Royal Signature Hotel and Suites', caption: 'Super Royal' },
  { src: '/media/rooms/apartment-amsterdams.webp', alt: "Apartment Amsterdam's interior at Royal Signature Hotel and Suites", caption: "Apartment Amsterdam's" },
  { src: '/media/property/hotel-walkway.webp', alt: 'Interior walkway at Royal Signature Hotel and Suites', caption: 'Hotel Walkway' },
  { src: '/media/property/hotel-staircase.webp', alt: 'Staircase at Royal Signature Hotel and Suites', caption: 'Hotel Staircase' },
  { src: '/media/property/hotel-dining-area.webp', alt: 'Dining area at Royal Signature Hotel and Suites', caption: 'Dining Area' },
];

export default function GalleryPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">A closer look</p>
          <h1>Gallery</h1>
          <p>Browse Royal Signature room interiors and spaces around the hotel.</p>
        </div>
      </section>
      <section className="page-content">
        <div className="property-photo-grid" aria-label="Royal Signature Hotel and Suites gallery">
          {photos.map((photo) => (
            <figure className="property-photo-card" key={photo.src}>
              <img src={photo.src} alt={photo.alt} loading="lazy" />
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}