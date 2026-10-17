'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchAccommodationTypes, fetchReviews, postReview } from '@/app/api';
import BrandLoader from '@/components/royal/BrandLoader';

const ratings = [5, 4, 3, 2, 1];
const starValues = [1, 2, 3, 4, 5];

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? ''
    : new Intl.DateTimeFormat('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [reviewsError, setReviewsError] = useState('');
  const [accommodationsError, setAccommodationsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [rating, setRating] = useState('5');
  const [formState, setFormState] = useState('idle');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchReviews().then(({ data }) => {
        if (active) setReviews(data);
      }).catch((error) => {
        if (active) setReviewsError(error.message || 'Guest reviews could not be loaded.');
      }),
      fetchAccommodationTypes().then((data) => {
        if (active) setAccommodations(data);
      }).catch((error) => {
        if (active) setAccommodationsError(error.message || 'Room types could not be loaded.');
      }),
    ]).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const ratingCounts = useMemo(() => ratings.reduce((counts, value) => {
    counts[value] = reviews.filter((review) => Number(review.rating) === value).length;
    return counts;
  }, {}), [reviews]);
  const summary = useMemo(() => {
    const total = reviews.length;
    const average = total
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
      : 0;
    return { total, average };
  }, [reviews]);
  const visibleReviews = useMemo(
    () => ratingFilter === 'all'
      ? reviews
      : reviews.filter((review) => Number(review.rating) === Number(ratingFilter)),
    [ratingFilter, reviews]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setFormState('submitting');
    setFormMessage('');
    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      await postReview({
        name: values.get('name'),
        email: values.get('email'),
        title: values.get('title'),
        post_id: Number(values.get('post_id')),
        rating: Number(values.get('rating')),
        review: values.get('review'),
      });
      form.reset();
      setRating('5');
      setFormState('success');
      setFormMessage('Thank you. Your review has been submitted and will appear after approval by the hotel.');
    } catch (error) {
      setFormState('error');
      setFormMessage(error.message || 'Your review could not be submitted. Please try again.');
    }
  }

  if (loading) return <BrandLoader label="Loading guest reviews..." />;

  return (
    <main>
      <section className="page-content reviews-page">
        <div className="reviews-layout">
          <div className="reviews-main-column">
            <h1>Guest Reviews</h1>
            <section className="review-form-section" id="write-review" aria-labelledby="write-review-title">
              <h2 id="write-review-title">Write a Review</h2>
              {accommodationsError && <p className="review-inline-error" role="alert">{accommodationsError}</p>}
              {!accommodationsError && accommodations.length === 0 && (
                <p className="review-inline-error" role="status">A published room or suite is required before a review can be submitted.</p>
              )}
              <form className="review-form" onSubmit={handleSubmit}>
                <label htmlFor="review-name">
                  <span className="visually-hidden">Your Name</span>
                  <input id="review-name" name="name" placeholder="Your Name" autoComplete="name" maxLength={120} required />
                </label>
                <label htmlFor="review-email">
                  <span className="visually-hidden">Your Email</span>
                  <input id="review-email" name="email" type="email" placeholder="Your Email" autoComplete="email" maxLength={254} required />
                </label>
                <label htmlFor="review-title">
                  <span className="visually-hidden">Review Title</span>
                  <input id="review-title" name="title" placeholder="Review Title" maxLength={180} required />
                </label>
                <label htmlFor="review-accommodation">
                  <span className="visually-hidden">Select Room or Suite</span>
                  <select id="review-accommodation" name="post_id" required defaultValue="" disabled={accommodations.length === 0}>
                    <option value="" disabled>Select Room or Suite</option>
                    {accommodations.map((accommodation) => (
                      <option key={accommodation.documentId || accommodation.id} value={accommodation.id}>{accommodation.title}</option>
                    ))}
                  </select>
                </label>
                <fieldset className="review-star-picker">
                  <legend>Your Rating</legend>
                  <div className="review-star-options">
                    {starValues.map((value) => (
                      <label key={value} aria-label={`${value} star${value === 1 ? '' : 's'}`}>
                        <input
                          type="radio"
                          name="rating"
                          value={value}
                          checked={Number(rating) === value}
                          onChange={(event) => setRating(event.target.value)}
                          required
                        />
                        <span aria-hidden="true">{value <= Number(rating) ? '★' : '☆'}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="review-message-field" htmlFor="review-message">
                  <span className="visually-hidden">Share your experience</span>
                  <textarea id="review-message" name="review" placeholder="Share your experience..." minLength={10} maxLength={5000} rows={5} required />
                </label>
                <button className="nav-book" type="submit" disabled={formState === 'submitting' || accommodations.length === 0}>
                  {formState === 'submitting' ? 'Submitting...' : 'Submit Review'}
                </button>
                {formMessage && <p className={formState === 'error' ? 'form-error' : 'form-success'} role={formState === 'error' ? 'alert' : 'status'}>{formMessage}</p>}
              </form>
            </section>

            {reviewsError ? (
              <p className="review-load-error" role="alert">{reviewsError}</p>
            ) : (
              <>
                <div className="review-list-heading">
                  <h2>{ratingFilter === 'all' ? 'Guest Experiences' : `${ratingFilter}-Star Reviews`}</h2>
                  <span>{visibleReviews.length} review{visibleReviews.length === 1 ? '' : 's'}</span>
                </div>
                {visibleReviews.length ? (
                  <div className="published-review-list">
                    {visibleReviews.map((review) => (
                      <article className="published-review" key={review.documentId || review.id}>
                        <div className="published-review-meta">
                          <span className="review-avatar" aria-hidden="true">{review.name?.trim().charAt(0).toUpperCase() || 'G'}</span>
                          <div className="review-card-content">
                            <div className="review-card-topline">
                              <h3>{review.name}</h3>
                              {formatDate(review.date) && <time dateTime={review.date}>{formatDate(review.date)}</time>}
                            </div>
                            <div className="published-review-rating" aria-label={`${review.rating} out of 5 stars`}>
                              {'★'.repeat(Number(review.rating) || 0)}
                              <span className="visually-hidden">{review.rating} out of 5 stars</span>
                            </div>
                            {review.accommodation_type?.title && <p className="review-room-name">{review.accommodation_type.title}</p>}
                            {review.title && <h4>{review.title}</h4>}
                            <p className="review-body">{review.review}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="review-empty-state">
                    <h2>{reviews.length ? 'No reviews match this filter' : 'No approved reviews yet'}</h2>
                    <p>{reviews.length ? 'Choose another rating to see guest feedback.' : 'Guest reviews will appear here after approval by the hotel.'}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="review-sidebar" aria-label="Review ratings and filters">
            <section className="rating-summary">
              <h2>Rating Summary</h2>
              <div className="rating-total">
                <strong>{summary.average.toFixed(1)}</strong>
                <div>
                  <span className="rating-total-stars" aria-label={`${summary.average.toFixed(1)} out of 5 stars`}>
                    {'★'.repeat(Math.round(summary.average))}
                    <span className="visually-hidden">{summary.average.toFixed(1)} out of 5 stars</span>
                  </span>
                  <small>{summary.total} approved review{summary.total === 1 ? '' : 's'}</small>
                </div>
              </div>
              <div className="rating-breakdown">
                {ratings.map((value) => (
                  <div className="rating-breakdown-row" key={value}>
                    <span>{value} star{value === 1 ? '' : 's'}</span>
                    <span className="rating-track"><span style={{ width: `${summary.total ? (ratingCounts[value] / summary.total) * 100 : 0}%` }} /></span>
                    <span>{summary.total ? Math.round((ratingCounts[value] / summary.total) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="review-filter-panel" aria-labelledby="review-filter-title">
              <h2 id="review-filter-title">Filter Reviews</h2>
              <div className="review-filter-options">
                <button  type="button" aria-pressed={ratingFilter === 'all'} onClick={() => setRatingFilter('all')}>All</button>
                {ratings.map((value) => (
                  <button type="button" key={value} aria-pressed={ratingFilter === String(value)} onClick={() => setRatingFilter(String(value))}>
                    {value} Star
                  </button>
                ))}
              </div>
            </section>
            <p className="review-sidebar-note">Reviews are shown after moderation by the hotel.</p>
            <Link href="/rooms" className="review-sidebar-link">Explore our rooms</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
