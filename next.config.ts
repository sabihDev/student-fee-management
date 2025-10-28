

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // 👈 Forces Webpack builder
  },
};

module.exports = nextConfig;
