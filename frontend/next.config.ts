import type { NextConfig } from "next";
import path from "path";

/**
 * Headers every response carries.
 *
 * The checkout was framable, which is all a clickjacking overlay needs, and
 * nothing told a browser to stop sniffing content types. None of this is
 * exotic; it was simply never set.
 */
const securityHeaders = [
  // The checkout must not be placed inside anyone else's page.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on the site needs a camera, a microphone, or a payment handler.
  // Location is asked for by name, from the address form, and nowhere else.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(), geolocation=(self)"
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Vercel's image optimiser answers 402 Payment Required on this account:
    // the plan's allowance is spent, so every size it had not already cached
    // came back broken. The maison resizes its own photographs instead — the
    // copies live in R2 beside the originals and are served by the Worker, so
    // there is no allowance to spend and nothing that can run out.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    // The widths the Worker actually keeps a copy at. Asking for anything else
    // only makes a browser download more than it can show.
    deviceSizes: [320, 640, 1080],
    imageSizes: [320],
    // Every host here can hand bytes to the image optimiser, so the list is
    // exactly the hosts we use and no wildcard beyond them. A "**.workers.dev"
    // entry used to sit here, which let anyone with a free Cloudflare
    // subdomain feed files to our own server.
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
      }
    ]
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
