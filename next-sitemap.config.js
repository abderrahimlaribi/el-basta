/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://elbasta.store',
  generateRobotsTxt: false, // We already have a custom robots.txt
  exclude: ['/admin*', '/admin-auth*', '/api/*'],
  generateIndexSitemap: true,
  outDir: 'public',
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin-auth', '/api'],
      },
    ],
    additionalSitemaps: [
      'https://elbasta.store/sitemap.xml',
    ],
  },
}