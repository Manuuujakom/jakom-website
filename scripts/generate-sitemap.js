const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

// Replace this with your actual deployed domain
const siteUrl = 'https://yourdomain.com';

const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  // Add all your actual routes here
];

(async () => {
  const sitemap = new SitemapStream({ hostname: siteUrl });
  const writeStream = createWriteStream(path.resolve(__dirname, '../public/sitemap.xml'));
  sitemap.pipe(writeStream);

  links.forEach(link => sitemap.write(link));
  sitemap.end();

  await streamToPromise(sitemap);
  console.log('✅ Sitemap generated at public/sitemap.xml');
})();
