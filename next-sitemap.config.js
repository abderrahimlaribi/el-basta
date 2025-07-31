/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://elbasta.store',
  generateRobotsTxt: false, // We already have a custom robots.txt
  exclude: ['/admin*', '/admin-auth*', '/api/*'],
  generateIndexSitemap: false, // Prevent nested indexing issues
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
  },
}
