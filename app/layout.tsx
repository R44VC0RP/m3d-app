import type { Metadata } from "next";
import { overusedGrotesk } from "./fonts";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

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
      </head>
      <body className={`${overusedGrotesk.variable} antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
