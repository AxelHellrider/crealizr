import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep config minimal for broad platform compatibility. Netlify plugin will handle output/SSR.
  // Gate React Compiler behind an env var to avoid unsupported deployments on some hosts.
  reactCompiler: process.env.REACT_COMPILER === "true",
  async redirects() {
    return [
      { source: "/scale", destination: "/monster-scaler", permanent: true },
      { source: "/scale/docs", destination: "/monster-scaler/docs", permanent: true },
      { source: "/balance", destination: "/encounter-builder", permanent: true },
      { source: "/balance/docs", destination: "/encounter-builder/docs", permanent: true },
      { source: "/items", destination: "/artifact-forge", permanent: true },
      { source: "/items/docs", destination: "/artifact-forge/docs", permanent: true },
      { source: "/encounters-en-route", destination: "/travel-encounters", permanent: true },
    ];
  },
};

export default nextConfig;
