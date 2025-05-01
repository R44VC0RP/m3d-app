import { Button } from "@/components/ui/button"
import { Logo } from "./logo"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="container relative">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center text-center">
          <Logo className="w-[48px] h-auto text-foreground mb-8" />

          {/* Heading */}
          <h1 className="font-heading text-4xl mb-6 font-medium">
            Ready to bring
            <br />
            your ideas to life?
          </h1>

          {/* Description */}
          <p className="max-w-[30rem] leading-normal text-muted-foreground mb-8">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s.
          </p>

          {/* CTA Button */}
          <Button variant="primary-accent" size="medium">
            Get started
          </Button>
        </div>
      </div>
    </section>
  )
} 