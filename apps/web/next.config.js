/** @type {import('next').NextConfig} */
const normalizeUrl = (value) => {
  if (!value) {
    return ''
  }
  return value.endsWith('/') ? value.slice(0, -1) : value
}

const apiBaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001')

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['recharts'],
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return []
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl || 'http://localhost:4001'}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
