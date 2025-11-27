import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent 3D printing pricing. Pay per gram with no hidden fees. Get an instant quote by uploading your file. No minimums, no middlemen.",
  keywords: [
    "3D printing pricing",
    "3D print cost",
    "how much does 3D printing cost",
    "instant 3D print quote",
    "cheap 3D printing",
    "affordable 3D printing",
    "PLA printing cost",
    "per gram 3D printing",
  ],
  openGraph: {
    title: "Pricing | Mandarin3D",
    description:
      "Transparent pricing. Pay per gram based on material usage. No hidden fees, no minimums. Get an instant quote.",
    url: "https://mandarin3d.com/pricing",
  },
  alternates: {
    canonical: "https://mandarin3d.com/pricing",
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        <Header />
      </div>

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Pricing
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
          Fair Pricing on Quality Prints
        </h1>
        
        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            No hidden fees, no surprise charges. Upload your file and get an instant 
            quote based on actual material usage. What you see is what you pay.
          </p>
          
          <Link href="/upload">
            <Button variant="primary" size="large" className="gap-2">
              <Upload className="w-4 h-4" />
              Get Your Instant Quote
            </Button>
          </Link>
        </div>
      </section>

      {/* How Pricing Works */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            How Pricing Works
          </h2>
          
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Pricing is simple: you pay based on how much material your print uses, 
              plus a small base fee that covers setup, inspection, and packaging.
            </p>
            
            <p>
              When you upload a file, the system calculates the exact amount of plastic 
              needed for your print. The quote you see is the quote you pay—no 
              back-and-forth, no waiting for someone to manually review your file.
            </p>

            <p>
              Material costs vary based on the type of filament (PLA vs PETG, standard 
              vs specialty colors), but the pricing is always transparent. You'll see 
              the breakdown before you checkout.
            </p>

            <p>
              Shipping is calculated separately at checkout based on your location and 
              package size. I use actual carrier rates—no markup.
            </p>
          </div>
        </div>
      </section>

      {/* What Affects Price */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          What Affects Your Price
        </h2>
        
        <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Size & Weight</h3>
            <p>
              The biggest factor. A small keychain uses a few grams of plastic; a large 
              enclosure might use hundreds. The instant quote calculates exact material 
              usage from your 3D model.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Material Type</h3>
            <p>
              Standard PLA is the most economical. PETG costs a bit more due to material 
              costs. Specialty filaments (glow-in-the-dark, carbon fiber, etc.) have 
              their own pricing.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Infill Density</h3>
            <p>
              Most prints don't need to be solid. The default infill settings balance 
              strength and material usage. If you need something extra sturdy, higher 
              infill uses more material.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Quantity</h3>
            <p>
              Printing multiples of the same part is efficient—setup is the same whether 
              I'm printing one or ten. Larger orders get better per-unit pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            Optional Add-ons
          </h2>
          
          <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                MultiColor Printing — $2
              </h3>
              <p>
                Enable multi-color or multi-material printing using the AMS system. 
                Requires a follow-up consultation to make sure your design is set up 
                correctly for the best results.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Queue Priority — $15
              </h3>
              <p>
                Jump to the front of the queue. Typically shaves 3-5 days off your 
                turnaround time. Good for when you need something faster than the 
                standard ~1 week.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Print Assistance — Free
              </h3>
              <p>
                Not sure if your model is print-ready? I'll review your settings and 
                reach out before printing if anything looks off. No charge—I'd rather 
                catch issues before they waste material.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Price Examples */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          Ballpark Estimates
        </h2>
        
        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            Every print is different, but here's a rough idea of what things typically cost:
          </p>

          <div className="space-y-4">
            <p>
              <strong className="text-foreground">Small parts</strong> (keychains, clips, 
              small brackets) — Usually a few dollars. These use minimal material.
            </p>
            
            <p>
              <strong className="text-foreground">Medium objects</strong> (phone stands, 
              figurines, custom housings) — Typically $5-15 depending on complexity and size.
            </p>
            
            <p>
              <strong className="text-foreground">Large items</strong> (enclosures, 
              decorative pieces, functional parts) — $15-40+ depending on how much 
              material they need.
            </p>
            
            <p>
              <strong className="text-foreground">Extra large prints</strong> — Bigger 
              parts use more plastic. A full-size prop or large container can run $50+.
            </p>
          </div>

          <p className="text-base mt-8">
            These are rough estimates for standard PLA. The best way to know what your 
            specific print will cost is to upload the file—it takes 30 seconds and 
            you'll get an exact price.
          </p>
        </div>
      </section>

      {/* Why We're Affordable */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            Why the Prices Are Fair
          </h2>
          
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              I'm not the cheapest because I cut corners. I'm affordable because I run 
              things efficiently:
            </p>

            <p>
              <strong className="text-foreground">No middlemen.</strong> You're buying 
              directly from me. No distributors, no platform fees, no markup chains eating 
              into your budget.
            </p>
            
            <p>
              <strong className="text-foreground">Modern equipment.</strong> BambuLab 
              printers are fast and reliable. Higher throughput means I can spread fixed 
              costs across more prints.
            </p>
            
            <p>
              <strong className="text-foreground">No retail overhead.</strong> This is an 
              online operation. No expensive storefront, no retail staff—just me, the 
              printers, and your orders.
            </p>
            
            <p>
              <strong className="text-foreground">Fair margins.</strong> I'd rather have 
              happy repeat customers than squeeze maximum profit from each order. Good 
              prices build long-term relationships.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          Common Questions
        </h2>
        
        <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              How accurate is the instant quote?
            </h3>
            <p>
              Very accurate. The system uses professional slicing software to calculate 
              exact material usage. The price you see when you upload is the price you 
              pay (plus shipping and any add-ons you select).
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Do you offer volume discounts?
            </h3>
            <p>
              For larger orders or ongoing production runs, reach out at{" "}
              <a
                href="mailto:orders@mandarin3d.com"
                className="text-primary hover:underline"
              >
                orders@mandarin3d.com
              </a>
              . I'm happy to discuss custom pricing for bulk work—like the 3,500+ 
              keychains I did for Vercel.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              What if my file is too big for your printers?
            </h3>
            <p>
              Standard P1S printers handle up to 250×250×250mm. For larger parts (up to 
              340×320×340mm), I have H2S printers available. If your part exceeds those 
              dimensions, we can discuss splitting it into multiple pieces.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Are there any hidden fees?
            </h3>
            <p>
              No. The price shown is what you pay for printing. Shipping is calculated 
              separately at checkout based on your location and package size—I use actual 
              carrier rates with no markup.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              What's the turnaround time?
            </h3>
            <p>
              Most orders ship within about a week. If you need it faster, add Queue 
              Priority and I'll bump your order to the front.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            Ready to Get Started?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Upload your file and get an instant quote. No account required, no 
            commitment—just see what your print would cost.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button variant="primary" size="large" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Your File
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" size="large">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
