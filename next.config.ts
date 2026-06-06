import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export a fully static site (no Node server needed). All data is loaded
  // client-side via Firebase, so this deploys cleanly to Netlify, Firebase
  // Hosting, or any static host.
  output: "export",
  images: {
    // Static export has no image optimization server, so serve images as-is.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
