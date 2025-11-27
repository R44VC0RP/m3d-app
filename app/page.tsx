import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FileUpload } from "@/components/FileUpload";
import BackgroundMask from "@/components/BackgroundMask";
import { OtherProducts } from "@/components/other-products";
import ScrollButton from "@/components/ScrollButton";
import { CustomerShowcase } from "@/components/customer-showcase";
import VendorShowcase from "@/components/vendor-showcase";

export const metadata: Metadata = {
  title: "Custom 3D Printing | Instant Quotes | Mandarin3D",
  description:
    "Get instant quotes on custom 3D prints. Upload your STL, OBJ, or STEP file and we'll bring it to life. No middlemen, no minimums—just quality prints from Jacksonville, FL.",
  keywords: [
    "custom 3D printing",
    "instant 3D print quote",
    "Jacksonville 3D printing",
    "upload STL file",
    "3D print service",
    "PLA printing",
    "PETG printing",
    "no minimum order 3D printing",
  ],
  openGraph: {
    title: "Custom 3D Printing | Instant Quotes | Mandarin3D",
    description:
      "Upload your design, get an instant quote. Custom 3D printing done right—no middlemen, no minimums.",
    url: "https://mandarin3d.com",
  },
  alternates: {
    canonical: "https://mandarin3d.com",
  },
};

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
  const otherProducts = await getOtherProducts();
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
        <FileUpload currentStep={0} />
        {/* <OtherProducts items={otherProducts} /> */}
        <CustomerShowcase items={customerShowcase} />
      </div>
      <ScrollButton />
    </main>
  );
}
