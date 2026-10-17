import Link from 'next/link';
import { RiHome4Line, RiSearchLine } from 'react-icons/ri';

export default function Custom404() {
  return (
    <main className="bg-light min-h-screen pt-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {/* Illustration */}
          <div className="relative mb-8">
            <div className="w-48 h-48 rounded-full bg-accent/10 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-accent/30 flex items-center justify-center">
                  <span className="text-4xl font-bold text-accent">404</span>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RiHome4Line className="text-xl" />
              Return Home
            </Link>
            <Link
              href="/apartments"
              className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RiSearchLine className="text-xl" />
              Browse Apartments
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="mt-12 grid grid-cols-3 gap-4 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-lg bg-accent/30"></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
