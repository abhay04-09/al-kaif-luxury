import type { NextConfig } from "next";

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
  images: {
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
