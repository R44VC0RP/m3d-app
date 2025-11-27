import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/cart",
          "/dashboard",
          "/admin",
          "/signin",
        ],
      },
    ],
    sitemap: "https://mandarin3d.com/sitemap.xml",
  };
}

