/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost']
  },
  // Optimize CSS loading
  optimizeFonts: true,
  // Configure preloading options
  experimental: {
    optimizeCss: true,
    // Disable automatic CSS preloading that's not being used
    strictNextHead: true
  }
}

module.exports = nextConfig

 