import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  return [
    { url: `${baseUrl}/`, lastModified: now },
    { url: `${baseUrl}/monster-scaler`, lastModified: now },
    { url: `${baseUrl}/monster-scaler/docs`, lastModified: now },
    { url: `${baseUrl}/encounter-builder`, lastModified: now },
    { url: `${baseUrl}/encounter-builder/docs`, lastModified: now },
    { url: `${baseUrl}/artifact-forge`, lastModified: now },
    { url: `${baseUrl}/artifact-forge/docs`, lastModified: now },
    { url: `${baseUrl}/travel-encounters`, lastModified: now },
  ];
}
