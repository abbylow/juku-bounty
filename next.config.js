/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty");
    return config;
  },
  // TODO: change ipfs gateway to env var
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'indigo-capable-clownfish-921.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },
};

module.exports = nextConfig
