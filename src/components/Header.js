"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/placeholder-logo.png" alt="Solar Lgao Logo" width={40} height={40} />
            <span className="ml-2 text-xl font-bold text-primary-green">Solar Lgao</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-primary-green transition-colors">
              Home
            </Link>
            <Link href="/#about" className="hover:text-primary-green transition-colors">
              About
            </Link>
            <Link href="/#services" className="hover:text-primary-green transition-colors">
              Services
            </Link>
            <Link href="/#clients" className="hover:text-primary-green transition-colors">
              Clients
            </Link>
            <Link href="/#contact" className="hover:text-primary-green transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/signup" className="text-primary-green hover:underline">
              Become a Seller
            </Link>
            <Link href="/signin" className="btn-primary">
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-500 focus:outline-none" onClick={toggleMenu}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="hover:text-primary-green transition-colors" onClick={toggleMenu}>
                Home
              </Link>
              <Link href="/#about" className="hover:text-primary-green transition-colors" onClick={toggleMenu}>
                About
              </Link>
              <Link href="/#services" className="hover:text-primary-green transition-colors" onClick={toggleMenu}>
                Services
              </Link>
              <Link href="/#clients" className="hover:text-primary-green transition-colors" onClick={toggleMenu}>
                Clients
              </Link>
              <Link href="/#contact" className="hover:text-primary-green transition-colors" onClick={toggleMenu}>
                Contact
              </Link>
              <Link href="/provider/signup" className="text-primary-green hover:underline" onClick={toggleMenu}>
                Become a Seller
              </Link>
              <Link href="/signin" className="btn-primary inline-block text-center" onClick={toggleMenu}>
                Sign In
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

