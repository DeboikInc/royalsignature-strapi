import Link from 'next/link';

export default function NotFound() {
  return <main className="page-content"><p className="eyebrow eyebrow-dark">404</p><h1>We couldn't find that page.</h1><p>Return to the Royal Signature home page or explore the rooms and suites.</p><Link className="text-link" href="/">Return home</Link></main>;
}