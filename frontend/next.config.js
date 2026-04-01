const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nexus-prime-web.onrender.com',
  },
  serverRuntimeConfig: {
    ODDS_API_KEY: process.env.ODDS_API_KEY || 'df5fb65e1a3d0ab7904eed933dc7765a',
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
