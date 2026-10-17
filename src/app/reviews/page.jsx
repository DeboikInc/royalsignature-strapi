"use client";

import { useState, useEffect } from 'react';
import { RiUserFill } from 'react-icons/ri';
import { fetchReviews, postReview, fetchAccommodationTypes } from '@/app/api';
import Rating from '@/components/rating';
import Loader from '@/components/loader';
import { useToast } from '@/context/toastContext';

export default function ReviewPage() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [title, setTitle] = useState('');
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [post_id, setPost_id] = useState('');
  const [accommodationType, setAccommodationType] = useState([])
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    average: 0,
    total: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const { addToast } = useToast();


  useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewsData = await fetchReviews();
        const fetchAccommodation = await fetchAccommodationTypes();
        setAccommodationType(fetchAccommodation)
        setReviews(reviewsData?.data);

        // Calculate summary
        if (reviewsData?.data?.length > 0) {
          const total = reviewsData?.data?.length;
          const sum = reviewsData?.data?.reduce((acc, curr) => acc !== undefined ? Number(acc) + Number(curr.rating) : 0 + parseInt(curr.rating), 0);

          const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewsData?.data?.forEach(review => {
            const stars = Math.floor(parseInt(review.rating));
            breakdown[stars]++;
          });

          setSummary({
            average: sum,
            total,
            breakdown
          });
        }
      } catch (error) {
        setLoading(false);
        addToast(`Error loading reviews, pls try again`, 'error')
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !review.trim() || !title.trim()) return;

    try {
      const newReview = {
        post_id,
        rating: rating.toString(),
        title,
        review,
        // You might want to get these from user input or auth
        name,
        email
      };

      const createdReview = await postReview(newReview);

      // Update local state
      setReviews([{
        ...createdReview,
        rating,
        title,
        review,
        name: "You",
        date: new Date()
      }, ...reviews]);

      // Reset form
      setRating(0);
      setReview('');
      setTitle('');

      // Update summary
      const newTotal = summary.total + 1;
      const newAverage = (summary.average * summary.total + rating) / newTotal;
      const newBreakdown = { ...summary.breakdown };
      newBreakdown[rating] = (newBreakdown[rating] || 0) + 1;

      setSummary({
        average: newAverage,
        total: newTotal,
        breakdown: newBreakdown
      });

    } catch (error) {
      addToast(`Failed to submit review. Please try again.`, 'error')
    }
  };

  if (loading) {
    return (
      <main>
        <Loader />
      </main>
    )
  }

  return (
    <main className=" bg-light">
      <div className="flex flex-col md:flex-row gap-12 max-w-7xl mx-auto px-4 py-32">
        {/* Left Column - Reviews List */}
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-8">Guest Reviews</h1>

          {/* Review Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Write a Review</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 mb-4 space-x-2">
                <div>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

              </div>
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="Review title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  value={post_id}
                  onChange={(e) => setPost_id(e.target.value)}
                  required
                >
                  <option value="">Select Apartment</option>
                  {accommodationType.length > 0 && accommodationType.map((item) => (
                    <option value={item.id} key={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center mb-4">
                <span className="mr-3">Your Rating:</span>
                <div className="flex">
                  <Rating editable="true" size={25} onRatingChange={(val) => setRating(val)} className='md:space-x-2' />
                </div>
              </div>

              <div className="mb-4">
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  rows={5}
                  placeholder="Share your experience..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-accent cursor-pointer hover:bg-accent/90 text-white px-6 py-2 rounded-lg font-medium"
                disabled={rating === 0 || !review.trim() || !title.trim()}
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                    <RiUserFill className="text-gray-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Rating initialValue={item.rating} />
                      <span>•</span>
                      <span className="ml-2">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <h4 className="font-medium mb-2">{item.title}</h4>
                <p className="text-gray-700 overflow-auto">{item.review}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Rating Summary */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Rating Summary</h2>

            <div className="flex items-center mb-6">
              <div className="text-5xl font-bold mr-4">
                {summary.average.toFixed(1)}
              </div>
              <div>
                <Rating initialValue={summary.average.toFixed(1)} />
                <div className="text-sm text-gray-500">
                  Based on {summary.total} reviews
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center">
                  <div className="w-10 text-sm font-medium">{stars} star</div>
                  <div className="flex-1 mx-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${summary.total > 0
                          ? (summary.breakdown[stars] / summary.total * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                  <div className="w-8 text-sm text-gray-500 text-right">
                    {summary.total > 0
                      ? `${Math.round(summary.breakdown[stars] / summary.total * 100)}%`
                      : '0%'}
                  </div>
                </div>
              ))}
            </div>

            {/* Review Filters */}
            <div className="mt-8">
              <h3 className="font-medium mb-3">Filter Reviews</h3>
              <div className="flex flex-wrap gap-2">
                {['All', '5 Star', '4 Star', '3 Star'].map((filter) => (
                  <button
                    key={filter}
                    className="px-3 py-1 text-sm rounded-full border border-gray-200 hover:border-accent hover:text-accent"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
