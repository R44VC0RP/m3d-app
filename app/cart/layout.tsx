import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your 3D print order, configure materials, colors, and quantities. Proceed to checkout when ready.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Your Cart | Mandarin3D",
    description: "Review and configure your 3D print order.",
    url: "https://mandarin3d.com/cart",
  },
  alternates: {
    canonical: "https://mandarin3d.com/cart",
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

