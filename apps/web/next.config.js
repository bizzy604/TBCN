/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables that should be exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  },
  // Transpile packages if using monorepo shared packages
  transpilePackages: ['@tbcn/ui', '@tbcn/shared'],
};

module.exports = nextConfig;