/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig

module.exports = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'previews.123rf.com',
        },
        {
            protocol: 'https',
            hostname: 'www.thebluebook.com',
        },
        {
            protocol: 'https',
            hostname: 'img.freepik.com',
        },
      ],
    },
  }