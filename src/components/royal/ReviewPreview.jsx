'use client';

import { useEffect, useState } from 'react';
import { fetchReviews } from '@/app/api';
import BrandLoader from './BrandLoader';

export default function ReviewPreview() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    fetchReviews()
      .then((result) => { if (active) setReviews(result.data); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Guest reviews are temporarily unavailable.'); });
    return () => { active = false; };
  }, []);

  if (reviews === null && !error) return <BrandLoader label="Loading guest reviews..." />;
  if (error) return <p className="catalog-note" role="alert">{error}</p>;
  if (!reviews.length) return <p className="catalog-note">Guest reviews will appear here after they have been approved by the hotel.</p>;

  return (
    <div className="review-grid">
      {reviews.slice(0, 3).map((review) => (
        <blockquote className="review-quote" key={review.id}>
          <div role="img" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(Number(review.rating) || 0)}</div>
          <p>“{review.review}”</p>
          <cite>{review.name}{review.accommodation_type?.title ? ` · ${review.accommodation_type.title}` : ''}</cite>
        </blockquote>
      ))}
    </div>
  );
}