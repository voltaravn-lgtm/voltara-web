import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      'react-router-dom': './src/compat-router.tsx',
    },
  },
  webpack: (config) => {
    config.resolve.alias['react-router-dom'] = path.resolve(process.cwd(), 'src/compat-router.tsx');
    return config;
  },
};

export default nextConfig;
