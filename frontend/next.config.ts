import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        // Product photos uploaded through the admin panel are served from R2
        // by the Worker API (/api/images/...).
        protocol: "https",
        hostname: "al-kaiff-api.adpatel8376.workers.dev"
      },
      {
        protocol: "https",
        hostname: "**.workers.dev"
      },
      {
        // Custom domain for the API, once one is attached.
        protocol: "https",
        hostname: "**.al-kaif.com"
      }
    ]
  }
};

export default nextConfig;
