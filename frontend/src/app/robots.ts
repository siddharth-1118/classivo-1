import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = 86400;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_URL ??
  "https://classivo-1.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/app/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

