import type { Metadata } from "next";
import { overusedGrotesk } from "./fonts";
import "./globals.css";

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
    <html lang="en">
      <body className={`${overusedGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
