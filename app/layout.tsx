import type { Metadata } from "next";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { overusedGrotesk } from "./fonts";
import "./globals.css";
import { ConvAIWidget } from "@/components/ConvAIWidget";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://mandarin3d.com"),
  title: {
    default: "Mandarin3D | Custom 3D Printing in Jacksonville, FL",
    template: "%s | Mandarin3D",
  },
  description:
    "Custom 3D printing done right. Upload your design, get an instant quote. No middlemen, no minimums—just quality prints from Jacksonville, Florida.",
  keywords: [
    "3D printing",
    "custom 3D prints",
    "Jacksonville 3D printing",
    "Florida 3D printing",
    "instant quote",
    "STL printing",
    "PLA printing",
    "PETG printing",
    "prototype printing",
    "no minimum order",
    "BambuLab",
  ],
  authors: [{ name: "Mandarin 3D Prints" }],
  creator: "Mandarin 3D Prints",
  publisher: "Mandarin 3D Prints",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mandarin3d.com",
    siteName: "Mandarin3D",
    title: "Mandarin3D | Custom 3D Printing in Jacksonville, FL",
    description:
      "Custom 3D printing done right. Upload your design, get an instant quote. No middlemen, no minimums—just quality prints from Jacksonville, Florida.",
    // opengraph-image.jpeg in app/ is automatically used by Next.js
  },
  twitter: {
    card: "summary_large_image",
    title: "Mandarin3D | Custom 3D Printing in Jacksonville, FL",
    description:
      "Custom 3D printing done right. Upload your design, get an instant quote. No middlemen, no minimums.",
    // opengraph-image.jpeg in app/ is automatically used by Next.js
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Mandarin 3D Prints",
  description:
    "Custom 3D printing services in Jacksonville, Florida. No middlemen, no minimums. Upload your design and get an instant quote.",
  url: "https://mandarin3d.com",
  logo: "https://mandarin3d.com/favicon.svg",
  image: "https://mandarin3d.com/opengraph-image.jpeg",
  email: "orders@mandarin3d.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Jacksonville",
    addressRegion: "FL",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 30.3322,
    longitude: -81.6557,
  },
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
  priceRange: "$",
  foundingDate: "2021",
  knowsAbout: [
    "3D Printing",
    "Custom Manufacturing",
    "Rapid Prototyping",
    "PLA Printing",
    "PETG Printing",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "3D Printing Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Custom 3D Printing",
          description: "Upload your 3D model and get an instant quote",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Multi-Color Printing",
          description: "Full-color 3D printing with multiple materials",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Rush Orders",
          description: "Priority queue for faster turnaround",
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="[&::-webkit-scrollbar]:hidden">
      <head>
        <meta name="apple-mobile-web-app-title" content="Mandarin 3D" />
        <link rel="canonical" href="https://mandarin3d.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        {/* DataFast Analytics - proxied through our domain */}
        <Script
          strategy="afterInteractive"
          data-website-id="dfid_dZbkLw4jCLQyVbBpRNRbY"
          data-domain="mandarin3d.com"
          data-api-url="/api/datafast-events"
          src="/js/script.js"
        />
      </head>
      <body className={`${overusedGrotesk.variable} antialiased`}>
        <SessionProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
          {/* <ConvAIWidget /> */}
        </SessionProvider>
      </body>
    </html>
  );
}
