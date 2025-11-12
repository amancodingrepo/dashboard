/** @type {import('next').NextConfig} */
const normalizeUrl = (value) => {
  if (!value) return ''
  return value.endsWith('/') ? value.slice(0, -1) : value
}

// For production, use relative URLs when deployed on the same domain
// For development, use the configured API URL or default to localhost
const getApiBaseUrl = () => {
  // In production, return empty string to use relative URLs
  if (process.env.NODE_ENV === 'production') {
    return ''
  }
  // In development, use the configured API URL or default to localhost:4001
  return normalizeUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001')
}

const apiBaseUrl = getApiBaseUrl()

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['recharts'],
  // Enable source maps in development only
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  
  // Configure rewrites for API requests
  async rewrites() {
    // In production, we don't need rewrites as we're using relative URLs
    if (process.env.NODE_ENV === 'production') {
      return []
    }

    // In development, rewrite API requests to the API server
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
      // Add Vanna API rewrites if needed
      {
        source: '/vanna/:path*',
        destination: `${process.env.NEXT_PUBLIC_VANNA_URL || 'http://localhost:8000'}/:path*`,
      },
    ]
  },
  
  // Enable CORS for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
