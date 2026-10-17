'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiCloseLine, RiMenuLine } from 'react-icons/ri';
import BrandMark from './BrandMark';

const links = [
  ['/', 'Home'], ['/about', 'About'], ['/rooms', 'Rooms & Suites'],
  ['/amenities', 'Amenities'], ['/dining', 'Dining'], ['/events', 'Events'],
  ['/gallery', 'Gallery'], ['/contact', 'Contact'],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark />
        <button className="menu-toggle" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
        </button>
        <nav className={`main-nav ${open ? 'main-nav-open' : ''}`} aria-label="Main navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={close} aria-current={pathname === href ? 'page' : undefined}>
              {label}
            </Link>
          ))}
          <Link className="nav-book" href="/booking" onClick={close}>Book Now <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}