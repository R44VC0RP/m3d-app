import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload 3D Models",
  description:
    "Upload your STL, OBJ, STEP, or 3MF files and get an instant quote. We support 17+ 3D file formats with automatic conversion. Max 50MB per file.",
  keywords: [
    "upload STL",
    "upload OBJ",
    "upload STEP file",
    "3D model upload",
    "instant 3D printing quote",
    "STL to print",
    "3MF upload",
  ],
  openGraph: {
    title: "Upload 3D Models | Mandarin3D",
    description:
      "Drop your 3D files and get an instant quote. Supports STL, OBJ, STEP, 3MF, and more.",
    url: "https://mandarin3d.com/upload",
  },
  alternates: {
    canonical: "https://mandarin3d.com/upload",
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

