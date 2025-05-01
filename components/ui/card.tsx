import Image from "next/image"
import React from "react"

export interface CardProps {
  title: string
  description: string
  imageUrl: string
}

export const Card: React.FC<CardProps> = ({ title, description, imageUrl }) => {
  return (
    <div className="flex flex-col h-full border border-gray-300 rounded-lg overflow-hidden bg-white transition-shadow hover:shadow-md">
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm flex-grow line-clamp-2">{description}</p>
      </div>
      <div className="relative w-full h-48">
        <Image
          src={imageUrl || "/placeholder-product.png"}
          alt={title}
          fill
          className="object-cover w-full h-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  )
}