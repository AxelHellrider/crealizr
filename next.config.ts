import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep config minimal for broad platform compatibility. Netlify plugin will handle output/SSR.
  // Gate React Compiler behind an env var to avoid unsupported deployments on some hosts.
  reactCompiler: process.env.REACT_COMPILER === "true",
};

export default nextConfig;
