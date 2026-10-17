// components/NeighborhoodGuides.js
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { fetchRates, fetchAccommodationTypes } from '@/app/api'

export default function NeighborhoodGuides() {
  const [neighborhoodGuides, setNeighborhoodGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadNeighborhoodGuides = async () => {
      try {
        setLoading(true)
        // Fetch both rates and accommodation types
        const [rates, accommodationTypes] = await Promise.all([
          fetchRates(),
          fetchAccommodationTypes()
        ])

        // Get 2 apartments before the last 4 (positions 5 and 6 from the end if available)
        const startIndex = Math.max(0, rates.length - 6) // Start from 6th from end
        const endIndex = Math.max(0, rates.length - 4) // End before last 4
        const guideRates = rates.slice(startIndex, endIndex)

        // If we don't have enough rates, use the last available ones
        if (guideRates.length < 2) {
          guideRates.push(...rates.slice(-2))
        }

        // Map the data to neighborhood guide format
        const guides = guideRates.slice(0, 2).map((rate, index) => {
          const accommodation = accommodationTypes.find(acc => acc.id === rate.accommodation_type_id)

          // Use the neighborhood/view as the guide name, or fallback to location
          const getNeighborhoodName = () => {
            if (accommodation?.view) return accommodation.view
            if (accommodation?.location) return accommodation.location
            return ['Lagos, Nigeria', 'Lagos, Nigeria'][index] // Fallback to default names
          }

          const getTitle = () => {
            return `Living in ${getNeighborhoodName()}`
          }

          const getDescription = () => {
            const features = []
            if (accommodation?.bed_type) features.push(accommodation.bed_type)
            if (accommodation?.size) features.push(`${accommodation.size} sqft`)

            return `Discover beautiful ${features.join(' · ')} accommodations in ${getNeighborhoodName()}. Perfect for urban living with modern amenities.`
          }

          // Generate thumbnail images from accommodation images
          const getThumbnailImages = () => {
            if (accommodation?.images?.length >= 3) {
              return accommodation.images.slice(0, 4).map(img => img.src)
            }

            // Fallback images if not enough accommodation images
            const fallbackImages = [
              [
                'https://public.readdy.ai/ai/img_res/42b5d8f7f9f1e34a2c6bb5724bdf468e.jpg',
                'https://public.readdy.ai/ai/img_res/38ec72452db538ef580e8405dd08e06d.jpg',
                'https://public.readdy.ai/ai/img_res/8c5ed623253ba252a5d524f798dab045.jpg',
                'https://public.readdy.ai/ai/img_res/347888f62965c3cd7eae42d2ce3b8119.jpg'
              ],
              [
                'https://public.readdy.ai/ai/img_res/7935ac7990618407851a15b1739f6481.jpg',
                'https://public.readdy.ai/ai/img_res/9388c346589af45d23d5b99ec532e747.jpg',
                'https://public.readdy.ai/ai/img_res/a8db113e80451e8c3e16b2ce68696a84.jpg',
                'https://public.readdy.ai/ai/img_res/a17db859c8f1b346a88da581d360d607.jpg'
              ]
            ]
            return fallbackImages[index] || fallbackImages[0]
          }

          return {
            id: rate.id.toString(),
            name: getNeighborhoodName(),
            title: getTitle(),
            description: getDescription(),
            mainImage: accommodation?.images?.[0]?.src || 'https://via.placeholder.com/600x400',
            thumbnailImages: getThumbnailImages()
          }
        })

        setNeighborhoodGuides(guides)
      } catch (err) {
        setError('Failed to load neighborhood guides')
      } finally {
        setLoading(false)
      }
    }

    loadNeighborhoodGuides()
  }, [])

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="sm:text-4xl text-2xl font-bold mb-8">Neighborhood Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((item) => (
              <div key={item} className="bg-white rounded-lg overflow-hidden">
                <div className="animate-pulse h-80 bg-gray-200"></div>
                <div className="p-6">
                  <div className="animate-pulse h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="animate-pulse h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="animate-pulse h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex space-x-3 mb-5">
                    {[1, 2, 3, 4].map((thumb) => (
                      <div key={thumb} className="animate-pulse w-16 h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                  <div className="animate-pulse h-10 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="sm:text-4xl text-2xl font-bold mb-8">Neighborhood Guides</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="sm:text-4xl text-2xl font-bold mb-8">Neighborhood Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {neighborhoodGuides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-lg overflow-hidden">
              <div className="relative h-80">
                <img
                  src={guide.mainImage}
                  alt={`${guide.name} Guide`}
                  className="object-cover h-full w-full"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'
                  }}
                />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {guide.name}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{guide.title}</h3>
                <p className="text-gray-600 mb-4">{guide.description}</p>

                <div className="flex space-x-3 mb-5">
                  {guide.thumbnailImages.map((image, index) => (
                    <div key={index} className="w-16 h-16 rounded overflow-hidden">
                      <img
                        src={image}
                        alt={`${guide.name} neighborhood ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x64?text=Image'
                        }}
                      />
                    </div>
                  ))}
                </div>

                <Link
                  href={`/apartments/detail?id=${guide.id}`}
                  className="inline-block bg-accent hover:bg-accent/90 text-white px-5 py-2 font-medium rounded-lg whitespace-nowrap"
                >
                  Explore Neighborhood
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
