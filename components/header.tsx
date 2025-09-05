"use client"

import { Wordmark } from "@/components/wordmark"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { FaShoppingCart } from "react-icons/fa"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"

// Get session ID for cart
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const router = useRouter()

  // Get cart summary for badge
  const cartSummary = useQuery(api.cart.getCartSummary,
    sessionId ? { sessionId, userId: undefined } : 'skip'
  )

  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-2 sm:top-4 z-50 w-full transition-all duration-300 ${isScrolled ? 'px-2 sm:px-4' : 'px-0'}`}>
      <div className={`container mx-auto transition-all duration-300 ${isScrolled ? 'bg-white/10 shadow-lg backdrop-blur-lg rounded-lg' : ''}`}>
        <div className="flex h-14 sm:h-16 max-w-screen-2xl items-center justify-between px-3 sm:px-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Wordmark className="w-[120px] sm:w-[140px] h-auto text-foreground" color="currentColor" />
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Button variant="link" size="medium">
                Pricing
              </Button>
              <Button variant="link" size="medium">
                Sales
              </Button>
              <Button variant="link" size="medium">
                Library
              </Button>
              <SignedIn>
                <Button variant="link" size="medium">
                  Dashboard
                </Button>
              </SignedIn>
            </nav>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Login - Hidden on mobile */}
              <SignedOut>
                <Button variant="primary" size="medium" className="hidden sm:flex">
                  Login
                </Button>
              </SignedOut>
              
              {/* Print Now Button */}
              <Button 
                variant="primary-accent" 
                size="medium"
                onClick={() => router.push('/cart')}
              >
                <span className="hidden sm:inline">Print Now</span>
                <span className="sm:hidden">Print</span>
              </Button>
              
              {/* Cart Button */}
              <Button 
                variant="primary" 
                size="medium"
                onClick={() => router.push('/cart')}
              >
                <FaShoppingCart className="size-3" />
                {cartSummary && cartSummary.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {cartSummary.itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 