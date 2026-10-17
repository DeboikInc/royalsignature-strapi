// components/FeaturedProperties.js
'use client'

import Link from 'next/link'
import { RiArrowRightLine } from 'react-icons/ri'
import { useState, useEffect } from 'react'
import { fetchRates, fetchAccommodationTypes } from '@/app/api'
import { useToast } from '@/context/toastContext'

export default function FeaturedProperties() {
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { addToast } = useToast();

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        setLoading(true)
        // Fetch both rates and accommodation types
        const [rates, accommodationTypes] = await Promise.all([
          fetchRates(),
          fetchAccommodationTypes()
        ])

        // Get the last 4 rates (or accommodation types) for featured properties
        const lastFourRates = rates.slice(-4)

        // Map the data to match the component structure
        const properties = lastFourRates.map(rate => {
          const accommodation = accommodationTypes.find(acc => acc.id === rate.accommodation_type_id)

          // Generate a description based on accommodation details
          const getDescription = () => {
            if (!accommodation) return 'Luxury accommodation'

            const beds = accommodation.bed_type?.toLowerCase() || 'bed'
            const baths = Math.max(1, Math.floor((accommodation.adults || 2) / 2))
            const features = []

            if (accommodation.services?.length > 0) {
              features.push('Premium services included')
            }
            if (accommodation.amenities?.length > 0) {
              features.push('Luxury amenities')
            }

            return `${beds} · ${baths} bath${baths !== 1 ? 's' : ''}${features.length > 0 ? ', ' + features.join(', ') : ''}`
          }

          // Get price from rate data
          const getPrice = () => {
            const basePrice = rate.season_prices?.[0]?.base_price || 0
            return `${new Intl.NumberFormat('en-NG', {
              style: 'currency',
              currency: 'NGN'
            }).format(basePrice)}/night`
          }

          return {
            id: rate.id,
            title: rate.title || 'Luxury Accommodation',
            image: accommodation?.images?.[0]?.src || '/api/placeholder/300/400',
            description: getDescription(),
            price: getPrice(),
            accommodation_type_id: rate.accommodation_type_id
          }
        })

        setFeaturedProperties(properties)
      } catch (err) {
        setError('Failed to load featured properties')
        addToast(`Failed to check availability. Please try again.`, 'error')
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProperties()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-light">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="sm:text-4xl text-2xl font-bold mb-8 capitalize">Offers to inspire you</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse rounded-lg h-80 bg-gray-200"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-light">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="sm:text-4xl text-2xl font-bold mb-8 capitalize">Offers to inspire you</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-light">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="sm:text-4xl text-2xl font-bold mb-8 capitalize">Offers to inspire you</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((property) => (
            <Link
              key={property.id}
              href={`/apartments/detail?id=${property.id}`}
              className="group relative overflow-hidden rounded-lg h-80"
            >
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400?text=Image+Not+Found'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-1">{property.title}</h3>
                <p className="text-white/80 text-sm mb-3">{property.description}</p>
                <p className="text-white font-semibold text-sm mb-2">{property.price}</p>
                <span className="inline-flex items-center text-white text-sm font-medium">
                  View Details
                  <RiArrowRightLine className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}