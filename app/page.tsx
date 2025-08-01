'use client';

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
import FileGrid from "@/components/FileGrid";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

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

function getCustomerData() {
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

export default function Home() {
  const { cart } = useCart();
  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <main className="bg-black text-white">
      {/* Cart Button - Fixed Position */}
      <Link
        href="/cart"
        className="fixed top-6 right-6 z-50 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors shadow-lg"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
      </Link>

      <div className="relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#FF4500] rounded-full blur-[150px] opacity-20"></div>
        <Header />
        <Hero />
      </div>
      <div className="relative">
        <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#FF4500] rounded-full blur-[200px] opacity-10"></div>
        <div id="products" className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center mb-12">Available Files</h2>
          <FileGrid />
        </div>
      </div>
      <FeaturedProducts products={getFeaturedProducts()} />
      <TrustedPeople testimonials={getTestimonials()} />
      <div className="relative">
        <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#FF4500] rounded-full blur-[200px] opacity-10"></div>
        <FileUpload currentStep={0} />
      </div>
      <OtherProducts items={getOtherProducts()} />
      <CustomerShowcase items={getCustomerData()} />
      <VendorShowcase />
      <ScrollButton />
    </main>
  );
}
