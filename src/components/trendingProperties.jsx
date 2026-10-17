'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { RiArrowRightLine } from 'react-icons/ri'
import { fetchRates, fetchAccommodationTypes, fetchReviews } from '@/app/api'
import PropertyCard from './propertyCard '
import { useToast } from '@/context/toastContext'

export default function TrendingProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both rates and accommodation types
        const [rates, accommodationTypes, { data }] = await Promise.all([
          fetchRates(),
          fetchAccommodationTypes(),
          fetchReviews()
        ])

        // Combine the data to create property listings
        const combinedProperties = rates.map(rate => {
          const accommodation = accommodationTypes.find(acc => acc.id === rate.accommodation_type_id)

          // Find the base price (you might want to implement more sophisticated price logic)
          const basePrice = rate.season_prices
          const pricePerNight = `${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(basePrice?.[0]?.base_price || 0)}/night`
          const discountedPricePerNight = `${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(basePrice?.[1]?.base_price || 0)}/night`

          // Get the first image if available
          const image = accommodation?.images?.[0]?.src || 'https://via.placeholder.com/280x320'
          // Filter reviews for this accommodation
          const propertyReviews = data.filter(
            review => typeof review.post_id === 'number'
              ? review.post_id === accommodation?.id
              : Number(review.post_id) === accommodation?.id
          )

          // Calculate average rating
          const avgRating = propertyReviews.length > 0
            ? propertyReviews.reduce((sum, review) => sum + parseInt(review.rating), 0) / propertyReviews.length
            : 0 // Default if no reviews


          return {
            id: rate.id,
            title: rate.title || 'Untitled Property',
            location: accommodation?.view || 'Location not specified',
            image,
            price: pricePerNight,
            discounted: discountedPricePerNight,
            size: `Room Size: ${accommodation?.size || 'N/A'}sqm`,
            bed: `Bed: ${accommodation?.bed_type || 'N/A'}`,
            max: `Max: ${accommodation?.adults || 0} adults, ${accommodation?.children || 0} children`,
            rating: avgRating,
            reviews: propertyReviews.length,
            description: rate.description || '',
            tag: rate.status === 'active' ? { text: accommodation.tags[0]?.name, color: accommodation.tags[0]?.name === 'Bestseller' ? 'bg-green-500' : accommodation.tags[0]?.name === '-10%' ? 'bg-secondary' : 'bg-accent' } : null
          }
        })

        setProperties(combinedProperties)
      } catch (error) {
        addToast(`Error fetching properties: ${error}`, 'error');
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <p>Loading properties...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="sm:text-4xl text-2xl font-bold">Trending Properties</h2>
          <Link href="/apartments" className="text-accent font-medium flex items-center">
            View All
            <RiArrowRightLine className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="relative overflow-hidden">
          {properties.length === 0 ? (
            <p>No properties available at the moment.</p>
          ) : (
            <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} classes={'min-w-[280px] max-w-[280px]'} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
