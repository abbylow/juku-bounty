/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty");
    return config;
  },
  async redirects() {
    return [
      // Temporary redirect "/" root page to explore page
      // TODO: remove this when migrating landing page back to root page
      {
        source: '/',
        destination: '/explore',
        permanent: false,
      },
    ]
  },
};

module.exports = nextConfig
