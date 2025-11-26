import type { Metadata } from "next";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { overusedGrotesk } from "./fonts";
import "./globals.css";
import { ConvAIWidget } from "@/components/ConvAIWidget";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Mandarin 3D",
  description: "3D Printing, Reimagined",
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
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
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
