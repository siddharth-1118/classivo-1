import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = 86400;

const SITE_URL = "https://classivo-1.vercel.app";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_URL ??
  SITE_URL;

const publicRoutes = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/auth/login", changeFrequency: "monthly" as const, priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
