import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/app/",
    },
    sitemap: "https://Classivo123.vercel.app/sitemap.xml",
  };
}

