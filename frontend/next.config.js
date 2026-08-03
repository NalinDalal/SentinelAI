/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai', 'tesseract.js'],
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;