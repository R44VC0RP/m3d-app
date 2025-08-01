"use client"

import { Wordmark } from "@/components/wordmark"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

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
              <Link href="/files">
                <Button variant="link" size="medium">
                  Files
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="secondary" size="medium">
                  Cart
                </Button>
              </Link>
              <Button variant="primary" size="medium">
                Print Now
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
} 