import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"
import { TrustedPeople } from "@/components/trusted-people"
import { FileUpload } from "@/components/FileUpload"
import BackgroundMask from "@/components/BackgroundMask"
import { OtherProducts } from "@/components/other-products"

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

function getTestimonials() {
  return [
    {
      id: "1",
      name: "John Doe",
      role: "Software Engineer",
      company: "Vitalize Care",
      quote: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      imageUrl: "https://placehold.co/500x500"
    },
    {
      id: "2",
      name: "Jane Doe",
      role: "Software Engineer",
      company: "Vitalize Care",
      quote: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      imageUrl: "https://placehold.co/500x500"
    },
    {
      id: "3",
      name: "John Doe",
      role: "Software Engineer",
      company: "Vitalize Care",
      quote: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      imageUrl: "https://placehold.co/500x500"
    }
  ]
}

function getOtherProducts() {
  return [
    {
      title: "3D Prints",
      description: "Description for the category",
      imageUrl: "https://placehold.co/500x500",
    },
    {
      title: "Laser Cut Art",
      description: "Another cool category",
      imageUrl: "https://placehold.co/500x500",
    },
    {
      title: "Enamel Pins",
      description: "Cute enamel pin designs",
      imageUrl: "https://placehold.co/500x500",
    },
    {
      title: "Stickers",
      description: "High-quality vinyl stickers",
      imageUrl: "https://placehold.co/500x500",
    }
  ]
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()
  const otherProducts = await getOtherProducts()
  const testimonials = await getTestimonials()
  return (
    <main>
      <div className="fixed inset-0 -z-10">
        <BackgroundMask />
      </div>
      <div className="max-w-5xl mx-auto">
        <Header />
        <Hero />
        <FeaturedProducts products={featuredProducts} />
        <OtherProducts items={otherProducts} />
        <FileUpload currentStep={0}/>
        <TrustedPeople testimonials={testimonials} />
      </div>
    </main>
  )
}
