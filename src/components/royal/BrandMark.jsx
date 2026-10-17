import Link from 'next/link';

export default function BrandMark({ light = false }) {
  return (
    <Link href="/" className={`brand-lockup ${light ? 'brand-lockup-light' : ''}`} aria-label="Royal Signature Hotel and Suites home">
      <span className="brand-monogram" aria-hidden="true">RS</span>
      <span className="brand-name">
        <span>Royal Signature</span>
        <small>Hotel &amp; Suites</small>
      </span>
    </Link>
  );
}