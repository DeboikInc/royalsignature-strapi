import Image from 'next/image'
import Link from 'next/link'
import { RiArrowRightLine } from 'react-icons/ri'

const movingTips = [
  {
    id: 'moving-checklist',
    title: 'Ultimate Moving Checklist',
    date: 'June 15, 2025',
    description: 'Everything you need to do 8 weeks, 4 weeks, and 1 week before your move to stay organized.',
    image: 'https://public.readdy.ai/ai/img_res/92a6b77592d39fa35b526ea2ca81d837.jpg',
    alt: 'Moving Checklist'
  },
  {
    id: 'neighborhood-guide',
    title: 'How to Choose the Right Neighborhood',
    date: 'June 8, 2025',
    description: 'Key factors to consider when selecting your next neighborhood, from commute times to local amenities.',
    image: 'https://public.readdy.ai/ai/img_res/b78f55e9e735edd411254756ba3e14c4.jpg',
    alt: 'Neighborhood Guide'
  },
  {
    id: 'budgeting-tips',
    title: 'Budgeting for Your First Apartment',
    date: 'June 1, 2025',
    description: 'A comprehensive guide to all the costs you should anticipate when renting your first apartment.',
    image: 'https://public.readdy.ai/ai/img_res/1a82c879460269721f84778127bc3dec.jpg',
    alt: 'Budgeting Tips'
  }
]

export default function MovingTips() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="sm:text-4xl text-2xl font-bold mb-8">Moving Tips & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {movingTips.map((tip) => (
            <article key={tip.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <div className="relative">
                <img
                  src={tip.image}
                  alt={tip.alt}
                  className="object-cover object-top w-full h-full"
                />
              </div>
              <div className="p-6">
                <span className="text-xs text-gray-500">{tip.date}</span>
                <h3 className="text-lg font-bold mt-2 mb-3">{tip.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{tip.description}</p>
                <Link
                  href={`/tips/${tip.id}`}
                  className="inline-flex items-center text-accent font-medium text-sm"
                >
                  Read More
                  <RiArrowRightLine className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
