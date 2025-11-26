"use client"

import { Wordmark } from "@/components/wordmark"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useCallback } from "react"
import { FaShoppingCart } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { User } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()
  const { data: session } = useSession()

  // Fetch cart count
  const fetchCartCount = useCallback(async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.items?.length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error)
    }
  }, [])

  useEffect(() => {
    fetchCartCount()
    
    // Listen for cart updates
    const handleCartUpdate = () => fetchCartCount()
    window.addEventListener('cart-updated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
    }
  }, [fetchCartCount])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const user = session?.user

  return (
    <header className="sticky top-2 sm:top-4 z-50 w-full flex justify-center transition-all duration-300">
      <div className={`mx-auto transition-all duration-300 ${isScrolled ? 'w-[100%] bg-white/80 shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.04),0_4px_4px_0_rgba(0,0,0,0.02)] backdrop-blur-lg rounded-[12px] corner-squircle border border-[#d1d1d1]' : 'container'}`}>
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
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
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">

              {/* Print Now Button */}
              <Button
                variant="primary"
                size="medium"
                onClick={() => router.push('/cart')}
              >
                <span className="hidden sm:inline">Print Now</span>
                <span className="sm:hidden">Print</span>
              </Button>

              {/* Cart Button */}
              <div className="relative">
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={() => router.push('/cart')}
                >
                  <FaShoppingCart className="size-3" />
                </Button>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-semibold text-white bg-[#466F80] rounded-full px-1 shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>

              {/* User Avatar (when signed in) */}
              {user && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="h-[32px] w-[32px] rounded-[12px] corner-squircle border border-[#d1d1d1] bg-white shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.04),0_4px_4px_0_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer hover:border-[#b8b8b8] hover:bg-[#f9f9f9] transition-all duration-150 active:scale-[0.98]"
                  title="Go to Dashboard"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 