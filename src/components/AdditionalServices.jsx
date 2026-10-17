'use client'

import { useState, useEffect } from 'react'
import { fetchAccommodationServices } from '@/app/api'
import { RiCheckboxBlankLine, RiCheckboxFill } from 'react-icons/ri'

export default function AdditionalServices({ accommodationTypeId, onSelectionChange, nights = 1 }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState([])

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true)
        const servicesData = await fetchAccommodationServices(accommodationTypeId)
        setServices(servicesData)
      } catch (err) {
        setError('Failed to load additional services')
      } finally {
        setLoading(false)
      }
    }

    if (accommodationTypeId) loadServices()
  }, [accommodationTypeId])

  useEffect(() => {
    // Calculate total and notify parent whenever selection changes
    const selected = services.filter(s => selectedServiceIds.includes(s.id))
    const stayNights = Math.max(1, Number(nights) || 1)
    const total = selected.reduce((sum, service) => sum + Number(service?.price || 0) * (service?.repeatability === 'per_day' ? stayNights : 1), 0)
    onSelectionChange({ selectedServiceIds, selectedServices: selected, total })
  }, [selectedServiceIds, services, nights])

  const toggleService = (serviceId) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  if (loading) return <div className="text-center py-4">Loading services...</div>
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>
  if (services.length === 0) return null

  return (
    <div className="bg-white rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-6">Additional Services</h3>
      <p className="text-gray-600 mb-4">Enhance your stay with these optional services</p>

      <div className="space-y-4">
        {services.map(service => (
          <div
            key={service.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedServiceIds.includes(service.id)
                ? 'border-accent bg-accent/10'
                : 'border-gray-200 hover:border-accent'
              }`}
            onClick={() => toggleService(service.id)}
          >
            <div className="flex items-start">
              <div className="mt-1 mr-4 text-accent">
                {selectedServiceIds.includes(service.id) ? (
                  <RiCheckboxFill className="text-xl" />
                ) : (
                  <RiCheckboxBlankLine className="text-xl" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium">{service.title}</h4>
                  <span className="font-bold">
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN'
                    }).format(service.price)}
                  </span>
                </div>
                {service.repeatability === 'per_day' && (
                  <p className="text-gray-500 text-xs mt-2">Charged per night</p>
                )}
                {service.repeatability !== 'per_day' && (
                  <p className="text-gray-500 text-xs mt-2">Charged once per stay</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
