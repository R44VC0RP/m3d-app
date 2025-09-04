"use client"

import { Wordmark } from "@/components/wordmark"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { FaShoppingCart } from "react-icons/fa"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-4 z-50 w-full transition-all duration-300 ${isScrolled ? 'px-4' : 'px-0'}`}>
      <div className={`container mx-auto transition-all duration-300 ${isScrolled ? 'bg-white/10 shadow-lg backdrop-blur-lg rounded-lg' : ''}`}>
        <div className="flex h-14 max-w-screen-2xl items-center px-4">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Wordmark className="w-[125px] h-auto text-foreground" color="currentColor" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6">
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
              <SignedOut>
                <Button variant="primary" size="medium">
                  Login
                </Button>
              </SignedOut>
              <div className="flex items-center space-x-2">
              <Button variant="primary-accent" size="medium">
                Print Now
              </Button>
              <Button variant="primary" size="medium">
                <FaShoppingCart className="size-3" />
              </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
} 