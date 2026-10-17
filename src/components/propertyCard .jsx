// components/PropertyCard.js
'use client'

import Link from 'next/link'
import { RiCalendarLine, RiHeartLine, RiShareLine, RiCloseLine, RiFacebookFill, RiTwitterXFill, RiLinkedinFill, RiWhatsappFill, RiMailLine, RiLinksLine } from 'react-icons/ri'
import { useState, useEffect } from 'react'
import Rating from './rating'
// In your details page component
import Head from 'next/head'
import { useToast } from '@/context/toastContext'

export default function PropertyCard({ property, classes }) {
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  const { addToast } = useToast();
  const detailUrl = `/apartments/details?id=${property.id}${property.slug ? `&slug=${encodeURIComponent(property.slug)}` : ''}`

  useEffect(() => {
    // Set the current URL for sharing
    setCurrentUrl(`${window.location.origin}${detailUrl}`)
  }, [detailUrl])

  const handleShareClick = () => {
    // Check if Web Share API is supported (mostly mobile devices)
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: currentUrl,
      })
        .catch(() => {
          addToast(`Failed to share. Please try again.`, 'error')
        })
    } else {
      // Show custom share dialog for desktop users
      setShowShareOptions(true)
    }
  }

  const shareToSocialMedia = (platform) => {
    const shareText = `Check out this property: ${property.title}`

    let url = ''

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
        break
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`
        break
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(shareText + '\n' + currentUrl)}`
        break
      default:
        return
    }

    window.open(url, '_blank', 'width=600,height=400')
    setShowShareOptions(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        alert('Link copied to clipboard!')
        setShowShareOptions(false)
      })
      .catch(() => {
        addToast(`Failed to copy. Please try again.`, 'error')
      })
  }

  return (
    <div key={property.id} className={`${classes} bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md group`}>

      <Head>
        <title>{property.title}</title>
        <meta property="og:title" content={property.title} />
        <meta property="og:description" content={`Check out this property: ${property.title} located in ${property.location}`} />
        <meta property="og:image" content={property.image} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/apartments/details?id=${property.id}`} />
        <meta property="og:type" content="website" />

        {/* Twitter Card tags for better Twitter sharing */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={property.title} />
        <meta name="twitter:description" content={`Check out this property: ${property.title}`} />
        <meta name="twitter:image" content={property.image} />
      </Head>

      <div className="relative h-64 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-accent hover:text-white">
            <RiHeartLine />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-accent hover:text-white"
            onClick={handleShareClick}
          >
            <RiShareLine />
          </button>
        </div>

        {/* Tag */}
        {property.tag && (
          <div className="absolute top-3 left-3">
            <span className={`${property.tag.color} text-white text-xs px-2 py-1 rounded`}>
              {property.tag.text ?? 'Popular'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex">
            <Rating initialValue={property.rating} />
          </div>
          <span className="text-gray-500 text-xs ml-1">({property.reviews} reviews)</span>
        </div>

        {/* Property info */}
        <Link href={detailUrl}>
          <h3 className="font-bold mb-1 hover:text-primary">{property.title}</h3>
        </Link>
        <section className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 text-sm mb-3">
          {[
            property.size,
            property.bed,
            property.max,
            property.location
          ].filter(Boolean).map((detail, index) => (
            <div key={index} className="flex items-center">
              {detail}
              {index < 3 && <span className="mx-1 text-gray-300">•</span>}
            </div>
          ))}
        </section>
        {/* Price and booking */}
        <div className="flex justify-between items-center border-t pt-3">
          <div>
            <div className="text-gray-500 line-through text-sm">
              {property.discounted === '₦0.00/night' ? '' : property.discounted}
            </div>
            <div className="font-bold text-lg">{property?.price}</div>
          </div>
          <Link href={detailUrl} className="bg-accent/10 hover:bg-accent text-accent hover:text-white p-2 rounded-full transition-colors">
            <RiCalendarLine className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Share Modal */}
      {showShareOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Share this property</h3>
              <button
                onClick={() => setShowShareOptions(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => shareToSocialMedia('facebook')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mb-2">
                  <RiFacebookFill className="w-6 h-6" />
                </div>
                <span className="text-xs">Facebook</span>
              </button>

              <button
                onClick={() => shareToSocialMedia('twitter')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white mb-2">
                  <RiTwitterXFill className="w-6 h-6" />
                </div>
                <span className="text-xs">Twitter</span>
              </button>

              <button
                onClick={() => shareToSocialMedia('linkedin')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white mb-2">
                  <RiLinkedinFill className="w-6 h-6" />
                </div>
                <span className="text-xs">LinkedIn</span>
              </button>

              <button
                onClick={() => shareToSocialMedia('whatsapp')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
                  <RiWhatsappFill className="w-6 h-6" />
                </div>
                <span className="text-xs">WhatsApp</span>
              </button>

              <button
                onClick={() => shareToSocialMedia('email')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white mb-2">
                  <RiMailLine className="w-6 h-6" />
                </div>
                <span className="text-xs">Email</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white mb-2">
                  <RiLinksLine className="w-6 h-6" />
                </div>
                <span className="text-xs">Copy Link</span>
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>When you share, the link will include the property image and details.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
