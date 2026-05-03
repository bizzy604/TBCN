const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  },
  transpilePackages: ['@tbcn/ui', '@tbcn/shared'],
  webpack: (config) => {
    // Point to TypeScript source via the pnpm workspace symlink so
    // transpilePackages processes it natively instead of the CJS dist
    config.resolve.alias['@tbcn/shared'] = path.resolve(
      __dirname,
      'node_modules/@tbcn/shared/src/index.ts'
    );
    return config;
  },
};

module.exports = nextConfig;
