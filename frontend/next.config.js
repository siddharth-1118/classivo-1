if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  outputFileTracingRoot: __dirname,
  trailingSlash: true,
  reactStrictMode: true,

  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
