// components/Testimonial.js
'use client'

import { useState, useEffect } from 'react'
import { fetchReviews } from '@/app/api'
import Rating from './rating'
import { RiUserFill } from 'react-icons/ri'
import { useToast } from '@/context/toastContext'

export default function Testimonial() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast();


  useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewsData = await fetchReviews()
        setReviews(reviewsData.data.slice(0, 3)) // Only show 3 testimonials
      } catch (error) {
        addToast(`Error loading reviews: ${error}`, 'error');
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [])

  if (loading) return <div className="py-8 flex justify-center">Loading testimonials...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review, index) => (
        <div key={index} className="p-8 rounded-lg relative">
          <div className="absolute -top-4 -left-4 text-6xl text-accent/20">"</div>
          <div className="flex text-yellow-400 mb-4">
            <Rating initialValue={parseInt(review.rating)} />
          </div>
          <p className="text-gray-600 italic mb-6 relative z-10">
            "{review.review}"
          </p>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-accent bg-gray-100 flex items-center justify-center">
              <RiUserFill className="text-gray-400 text-xl" />
            </div>
            <div>
              <h4 className="font-bold">{review.name}</h4>
              <p className="text-gray-500 text-sm">Happy Resident</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
