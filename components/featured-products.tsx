import { ShopItem } from "./shop-item"

interface Product {
  id: string
  title: string
  price: number
  description: string
  imageUrl: string
}

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="w-full py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Featured Products</p>
            <h2 className="text-2xl font-medium tracking-tight text-foreground">Our Favorites – You'll Love Them Too</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ShopItem
                key={product.id}
                title={product.title}
                price={product.price}
                description={product.description}
                imageUrl={product.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 