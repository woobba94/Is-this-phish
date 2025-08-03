/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    runtime: 'edge',
  },
  eslint: {
    dirs: ['app', 'components', 'utils'],
  },
}

module.exports = nextConfig 