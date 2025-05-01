import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"

function getFeaturedProducts() {
  return [
    {
      id: "1",
      title: "The \"Shop\" Button",
      price: 49.99,
      description: "A fully open source customizable button with support for 3 unique endpoints",
      imageUrl: "https://placehold.co/500x500"
    },
    {
      id: "2",
      title: "Mechanical Keyboard Kit",
      price: 79.99,
      description: "Custom 3D printed mechanical keyboard case and plate set",
      imageUrl: "https://placehold.co/500x500"
    },
    {
      id: "3",
      title: "Desk Cable Manager",
      price: 29.99,
      description: "Sleek cable management solution with snap-fit design",
      imageUrl: "https://placehold.co/500x500"
    }
  ]
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()
  
  return (
    <main>
      <div className="max-w-4xl mx-auto">
        <Header />
        <Hero />
      </div>
      <FeaturedProducts products={featuredProducts} />
    </main>
  )
}
