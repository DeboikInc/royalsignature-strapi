'use client'

import { useEffect, useState } from 'react';
import { RiArrowUpLine } from 'react-icons/ri';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    addEventListener('scroll', handleScroll);

    return () => {
      removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 w-12 h-12 bg-accent text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      aria-label="Back to top"
    >
      <RiArrowUpLine />
    </button>
  );
}