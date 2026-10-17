import Link from 'next/link';

export default function BrandMark({ light = false }) {
  return (
    <Link href="/" className={`brand-lockup ${light ? 'brand-lockup-light' : ''}`} aria-label="Royal Signature Hotel and Suites home">
      <img src="/royal-signature-wordmark.png" alt="Royal Signature Hotel and Suites" />
    </Link>
  );
}