/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-api.printify.com",
        pathname: "/mockup/**",
      },
      {
        protocol: "https",
        hostname: "images.printify.com",
        pathname: "/mockup/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/images/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/images/:path*",
        destination: "/public/images/:path*",
      },
    ];
  },
};

export default nextConfig;
