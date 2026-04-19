import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `https://crealizr.net/`, lastModified: now },
    { url: `https://crealizr.net/monster-scaler`, lastModified: now },
    { url: `https://crealizr.net/monster-scaler/docs`, lastModified: now },
    { url: `https://crealizr.net/encounter-builder`, lastModified: now },
    { url: `https://crealizr.net/encounter-builder/docs`, lastModified: now },
    { url: `https://crealizr.net/artifact-forge`, lastModified: now },
    { url: `https://crealizr.net/artifact-forge/docs`, lastModified: now },
    { url: `https://crealizr.net/travel-encounters`, lastModified: now },
    { url: `https://crealizr.net/contact`, lastModified: now },
  ];
}
