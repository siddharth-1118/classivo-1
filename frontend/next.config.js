if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  outputFileTracingRoot: __dirname,
  trailingSlash: true,
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:7860/api/:path*',
      },
    ];
  },

  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
