'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RiMenuLine, RiCloseLine } from 'react-icons/ri'
import Image from 'next/image'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const Logo = "/logo.png"

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const NavLink = ({ href, children }) => (
    <Link
      href={href}
      onClick={closeMobileMenu}
      className={`block py-2 ${pathname === href ? 'text-primary font-bold' : 'text-gray-600 hover:text-accent'}`}
    >
      {children}
    </Link>
  )

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/aboutus', label: 'About Us' },
    { href: '/apartments', label: 'Apartments' },
    { href: '/contact', label: 'Contact Us' }
  ]

  return (
    <header className={`${isMobileMenuOpen ? 'bg-black bg-opacity-50 fixed inset-0 z-40' : ''}`}>
      <section className={`bg-white fixed w-full top-0 z-50 py-3 ${isScrolled ? 'shadow-md' : ''} ${isMobileMenuOpen ? 'h-full max-w-64 left-0 shadow-lg' : ''}`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <nav className='flex items-center justify-between'>
            <Link href="/" onClick={closeMobileMenu}>
              <Image src={Logo} width={150} height={40} alt='logo' className='w-3/4' />
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex md:space-x-5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href}>{item.label}</NavLink>
                </li>
              ))}
            </ul>

            <button
              type='button'
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
            </button>

            {!isMobileMenuOpen && (
              <div className="hidden md:block">
                <a href='/reviews' className="bg-accent hover:bg-accent/90 text-white px-6 py-3 font-medium rounded-lg whitespace-nowrap">
                  Give Us A Review
                </a>
              </div>
            )}
          </nav>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="mt-8 pt-14 border-t border-gray-200 space-y-6 md:hidden">
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <NavLink href={item.href}>{item.label}</NavLink>
                  </li>
                ))}
              </ul>
              <a href='/reviews' className="block text-center bg-accent hover:bg-accent/90 text-white px-6 py-3 font-medium rounded-lg">
                Give Us A Review
              </a>
            </div>
          )}
        </div>
      </section>
    </header>
  )
}
