'use client'

import { RiCloseCircleFill } from 'react-icons/ri'
import Link from 'next/link'

export default function PaymentFailed({ errorMessage, bookingId, onRetry }) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 text-center">
      <div className="flex justify-center mb-4">
        <RiCloseCircleFill className="text-red-500 text-5xl" />
      </div>
      <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
      <p className="text-gray-600 mb-4">
        {errorMessage || 'We encountered an issue processing your payment.'}
      </p>

      {bookingId && (
        <p className="text-sm text-gray-500 mb-6">
          Booking reference: <span className="font-mono">{bookingId}</span>
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-medium"
        >
          Try Payment Again
        </button>
        <Link
          href="/contact"
          className="border border-gray-300 hover:border-accent text-gray-700 hover:text-accent px-6 py-3 rounded-lg font-medium text-center"
        >
          Contact Support
        </Link>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Need help? Call us at <span className="font-semibold">+234 800 000 0000</span>
      </p>
    </div>
  )
}
