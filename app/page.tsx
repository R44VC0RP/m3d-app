import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FeaturedProducts } from "@/components/featured-products";
import { TrustedPeople } from "@/components/trusted-people";
import { FileUpload } from "@/components/FileUpload";
import BackgroundMask from "@/components/BackgroundMask";
import { OtherProducts } from "@/components/other-products";
import ScrollButton from "@/components/ScrollButton";
import { CustomerShowcase } from "@/components/customer-showcase";
import VendorShowcase from "@/components/vendor-showcase";

function getFeaturedProducts() {
  return [
    {
      id: "1",
      title: 'The "Shop" Button',
      price: 49.99,
      description:
        "A fully open source customizable button with support for 3 unique endpoints",
      imageUrl: "https://placehold.co/500x500",
    },
    {
      id: "2",
      title: "Mechanical Keyboard Kit",
      price: 79.99,
      description: "Custom 3D printed mechanical keyboard case and plate set",
      imageUrl: "https://placehold.co/500x500",
    },
    {
      id: "3",
      title: "Desk Cable Manager",
      price: 29.99,
      description: "Sleek cable management solution with snap-fit design",
      imageUrl: "https://placehold.co/500x500",
    },
  ];
}

function getTestimonials() {
  return [
    {
      id: "1",
      name: "John Doe",
      role: "Software Engineer",
      company: "Vitalize Care",
      quote:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      imageUrl: "https://placehold.co/500x500",
    },
    {
      id: "2",
      name: "Jane Doe",
      role: "Software Engineer",
      company: "Vitalize Care",
      quote:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      imageUrl: "https://placehold.co/500x500",
    },
    {
      id: "3",
      name: "John Doe",
      role: "Software Engineer",
      company: "Vitalize Care",
      quote:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      imageUrl: "https://placehold.co/500x500",
    },
  ];
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
    },
  ];
}

function getCustomerShowcase() {
  return [
    {
      id: "1",
      title: "Big Order",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
      imageUrl: "/customerShowcase/big_order.jpeg",
      gridClass: "col-span-2 row-span-2",
    },
    {
      id: "2",
      title: "Vercel Key Id",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
      imageUrl: "/customerShowcase/vercel_key_id.jpeg",
      rotate: "90",
      gridClass: "col-span-1 row-span-2",
    },
    {
      id: "3",
      title: "Mic Accessory",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
      imageUrl: "/customerShowcase/mic_accessory.jpeg",
      gridClass: "col-span-1 row-span-1",
    },
    {
      id: "4",
      title: "Mini Apple CPU",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
      imageUrl: "/customerShowcase/mini_apple_cpu.jpeg",
      gridClass: "col-span-1 row-span-1",
    },
    {
      id: "5",
      title: "Tower",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
      imageUrl: "/customerShowcase/tower.jpeg",
      gridClass: "col-span-1 row-span-1",
    },
    {
      id: "6",
      title: "Keys",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
      imageUrl: "/customerShowcase/keys.jpeg",
      gridClass: "col-span-1 row-span-1",
    },
    {
      id: "7",
      title: "Windsurf Nameplate",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
      imageUrl: "/customerShowcase/windsurf_nameplate.jpeg",
      gridClass: "col-span-2 row-span-1",
    },
  ];
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const otherProducts = await getOtherProducts();
  const testimonials = await getTestimonials();
  const customerShowcase = await getCustomerShowcase();
  return (
    <main className="[&::-webkit-scrollbar]:hidden">
      <div className="absolute inset-0 -z-10">
        <BackgroundMask />
      </div>
      <div className="max-w-5xl mx-auto">
        <Header />
        <Hero />
        <VendorShowcase />
        <FeaturedProducts products={featuredProducts} />
        <FileUpload currentStep={0} />
        <OtherProducts items={otherProducts} />
        <CustomerShowcase items={customerShowcase} />
        <TrustedPeople testimonials={testimonials} />
      </div>
      <ScrollButton />
    </main>
  );
}
