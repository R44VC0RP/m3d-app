import React from "react"
import { Card, CardProps } from "./ui/card"

interface OtherProductsProps {
  items: CardProps[]
}

export function OtherProducts({ items }: OtherProductsProps) {
  return (
    <section className="w-full py-16">
      <div className="max-w-5xl mx-auto px-4 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">Other products</p>
          <h2 className="text-2xl font-medium tracking-tight text-foreground">
            Discover Even More Goodies
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <Card
              key={idx}
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 