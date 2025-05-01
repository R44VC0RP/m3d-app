import { Button } from "@/components/ui/button"
import Image from "next/image"
import { FaShoppingCart, FaCog } from "react-icons/fa"

interface ShopItemProps {
  title: string
  price: number
  description: string
  imageUrl: string
}

export function ShopItem({ title, price, description, imageUrl }: ShopItemProps) {
  return (
    <div className="flex flex-col items-start gap-2">

      <div className="flex items-center justify-between w-full pt-2">
        <div className="flex flex-col">
          <h3 className="font-medium text-base text-foreground">{title}</h3>
          <p className="text-muted-foreground font-medium">${price.toFixed(2)}</p>
        </div>
        <Button
          variant="primary"
          size="medium"
          className="rounded-sm w-10 h-10 p-0 flex items-center justify-center relative group"
        >
          <FaShoppingCart className="w-4 h-4 absolute transition-all duration-300 group-hover:opacity-0 group-hover:scale-75" />
          <FaCog className="w-4 h-4 absolute transition-all duration-300 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-180" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </div>
      <p className="text-muted-foreground line-clamp-2">{description}</p>
      <div className="relative aspect-square overflow-hidden rounded-lg w-full bg-gradient-to-b from-[#1a1a1a] to-black p-8">
        <Image
          src={imageUrl || "/placeholder-product.png"}
          alt={title}
          className="object-contain w-full h-full"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      </div>
    </div>
  )
} 