'use client';

import { useEffect, useState } from 'react';
import { fetchReviews } from '@/app/api';

export default function ReviewPreview() {
  const [reviews, setReviews] = useState(null);
  useEffect(() => {
    let active = true;
    fetchReviews().then((result) => { if (active) setReviews(result.data || []); }).catch(() => { if (active) setReviews([]); });
    return () => { active = false; };
  }, []);

  if (reviews === null) return <p className="catalog-note" role="status">Loading guest feedback…</p>;
  if (!reviews.length) return <p className="catalog-note">Guest reviews will be shared here once verified reviews are available.</p>;

  return (
    <div className="review-grid">
      {reviews.slice(0, 3).map((review) => (
        <blockquote className="review-quote" key={review.id}>
          <div aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(Number(review.rating) || 0)}</div>
          <p>“{review.review}”</p>
          <cite>{review.name}</cite>
        </blockquote>
      ))}
    </div>
  );
}