import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24 px-4 sm:px-6">
      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="flex flex-col space-y-5 sm:space-y-8 order-1">

            {/* Heading */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-[-0.04em]">
              Ready to bring
              <br />
              your ideas to life?
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-lg">
              Ready to bring your ideas to life? We&apos;re here to help you create the perfect 3D printed product.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Link href="/upload" className="w-full sm:w-auto">
                <Button variant="primary" size="medium" className="w-full sm:w-auto">
                  Get an Instant Quote
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="secondary" size="medium" className="w-full sm:w-auto">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="relative order-2 mt-4 lg:mt-0">
            <div className="relative aspect-square max-w-[280px] sm:max-w-sm lg:max-w-md mx-auto lg:mx-0">
              <Image
                src="/h2s-image.png"
                alt="3D Printer - H2S Model"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 