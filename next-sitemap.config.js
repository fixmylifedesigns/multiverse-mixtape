/** @type {import('next-sitemap').IConfig} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  siteUrl: process.env.SITE_URL || "https://multiversemixtape.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/api/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};
