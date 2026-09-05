/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cloudflare Workers doesn't run Next's built-in (sharp-based) image
    // optimizer. Images are served as-is; put them behind Cloudflare Images
    // or a CDN with its own resizing if you need on-the-fly optimization.
    unoptimized: true,
  },
};

module.exports = nextConfig;

// Required so `next dev` picks up Cloudflare bindings (D1) locally too.
if (process.env.NODE_ENV === "development") {
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}
