/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    domains: ['localhost'],
  },
  // Add this to allow self-referencing API routes for images
  async rewrites() {
    return [
      {
        source: '/api/products/images/:path*',
        destination: '/api/products/images/:path*',
      },
    ];
  },
}

module.exports = nextConfig