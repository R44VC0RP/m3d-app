import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Mandarin 3D Prints is a Jacksonville, Florida based 3D printing company founded in 2021. No middlemen, no minimums—just quality custom prints at fair prices.",
  keywords: [
    "about Mandarin3D",
    "Jacksonville 3D printing company",
    "Florida 3D printing",
    "custom 3D printing business",
    "BambuLab printing",
    "local 3D printing",
  ],
  openGraph: {
    title: "About Mandarin3D | Jacksonville 3D Printing",
    description:
      "Founded in 2021. No middlemen, no minimums. Quality custom 3D prints from Jacksonville, FL.",
    url: "https://mandarin3d.com/about",
  },
  alternates: {
    canonical: "https://mandarin3d.com/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        <Header />
      </div>

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          About Mandarin3D
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
          Custom 3D Prints, Done Right
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground leading-relaxed">
            Mandarin3D started because I needed something 3D printed and the options were 
            terrible. The local library had a month-long wait and required jumping through 
            hoops. Online services wanted hundreds of dollars for a simple print. There had 
            to be a better way.
          </p>
          
          <p className="text-lg text-muted-foreground leading-relaxed mt-6">
            So in 2021, I decided to make a change and start it myself. What began as 
            solving my own problem turned into helping others with theirs. Now I run 
            Mandarin3D out of Jacksonville, Florida—making custom 3D printing accessible, 
            affordable, and actually convenient.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed">
            "Empowering people and businesses to bring their designs to life, layer by layer."
          </blockquote>
          <p className="text-muted-foreground mt-4">
            Helping shape the future, one layer at a time.
          </p>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          What Makes Us Different
        </h2>
        
        <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Middlemen</h3>
            <p>
              When you order from Mandarin3D, you're talking directly to the person making 
              your parts. No customer service scripts, no ticket numbers—just real 
              communication. That means better prices (no distributor markups) and faster 
              answers to your questions.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Minimums</h3>
            <p>
              Need just one custom bracket? One replacement part? No problem. I don't 
              require bulk orders because I understand that not every project needs 500 
              pieces. Order what you need, when you need it.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Local to Florida</h3>
            <p>
              Based in Jacksonville, FL, I can ship faster to Florida businesses and 
              residents. Supporting local means supporting your community—and getting 
              your parts quicker.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Fast Turnaround</h3>
            <p>
              Most projects ship within about a week. Not a month, not "2-3 weeks processing 
              plus shipping"—a week. Rush orders available if you need it even faster.
            </p>
          </div>
        </div>
      </section>

      {/* Notable Projects */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            Who We've Worked With
          </h2>
          
          <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
            <p>
              From one-off personal projects to large-scale corporate orders, Mandarin3D 
              has handled it all. Here are a few highlights:
            </p>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Vercel</h3>
              <p>
                Produced over 3,500 custom NFC keychains for Vercel's developer events. 
                Large-scale production with consistent quality across every single piece.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Mintlify</h3>
              <p>
                Custom keycaps for the Mintlify team—functional, branded pieces that 
                showcase what's possible with precision 3D printing.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">VHS's Life Partnership</h3>
              <p>
                Ongoing partnership providing VHS cleaner boxes. When you need reliable 
                production runs, Mandarin3D delivers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Capabilities */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          Technical Capabilities
        </h2>
        
        <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
          <p>
            I run a fleet of BambuLab P1S printers for most jobs, with a couple H2S 
            machines available for larger parts. These are professional-grade printers 
            known for their speed, reliability, and print quality.
          </p>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Build Volumes</h3>
            <p>
              Standard prints can be up to 250 × 250 × 250mm. For larger projects, the 
              H2S printers handle parts up to 340 × 320 × 340mm. If your design is bigger 
              than that, we can discuss splitting it into multiple pieces.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Materials</h3>
            <p>
              <strong>PLA</strong> is the go-to for most projects—eco-friendly, great 
              surface finish, and works well for prototypes, display pieces, and many 
              functional parts.
            </p>
            <p className="mt-4">
              <strong>PETG</strong> is available when you need more durability. It's 
              weather-resistant, handles heat better, and works great for outdoor use 
              or parts that take abuse.
            </p>
            <p className="mt-4">
              Need something specific? I work with BambuLab verified filaments for 
              consistent quality. Reach out if you have special material requirements.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Multi-Color Printing</h3>
            <p>
              Using the AMS (Automatic Material System), I can print in multiple colors 
              or materials in a single print. This requires a quick consultation before 
              printing to make sure your design is set up correctly.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            How It Works
          </h2>
          
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">1. Upload your file.</strong> Drop your 
              STL, OBJ, STEP, 3MF, or any of the other 17+ supported formats. The system 
              analyzes your model automatically.
            </p>
            
            <p>
              <strong className="text-foreground">2. Get an instant quote.</strong> Pricing 
              is calculated based on actual material usage—no guessing, no "request a quote 
              and wait 3 days."
            </p>
            
            <p>
              <strong className="text-foreground">3. Configure your order.</strong> Pick 
              your color, quantity, and any add-ons like priority shipping or multi-color 
              printing.
            </p>
            
            <p>
              <strong className="text-foreground">4. I print and ship.</strong> Every part 
              gets inspected before it goes out. Most orders ship within about a week.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          Got Questions?
        </h2>
        
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Want to talk about your project? Need help figuring out the right material? 
          Curious if I can print that weird thing you designed? Shoot me an email—I 
          actually read and respond to every message.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/upload">
            <Button variant="primary" size="large">
              Get an Instant Quote
            </Button>
          </Link>
          <a href="mailto:orders@mandarin3d.com">
            <Button variant="secondary" size="large" className="gap-2">
              <Mail className="w-4 h-4" />
              orders@mandarin3d.com
            </Button>
          </a>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Jacksonville, FL — Online only, not a walk-in shop</span>
        </div>
      </section>
    </main>
  );
}
