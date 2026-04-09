import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchAllSermons() {
  let allSermons = [];
  let currentPage = 1;
  const perPage = 50;
  
  while (true) {
    const response = await new Promise((resolve, reject) => {
      https.get(`https://wotgospel.ru/api/posts?per_page=${perPage}&page=${currentPage}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
    
    const sermons = response.data || [];
    if (sermons.length === 0) break;
    
    allSermons = [...allSermons, ...sermons];
    console.log(`📥 Page ${currentPage}: ${sermons.length} sermons (total ${allSermons.length})`);
    
    if (sermons.length < perPage) break;
    currentPage++;
  }
  
  return allSermons;
}

async function generateSitemap() {
  console.log('🚀 Generating full sitemap...');
  
  const sermons = await fetchAllSermons();
  console.log(`✅ Total sermons: ${sermons.length}`);
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  const staticUrls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/sermons', priority: '0.9', changefreq: 'daily' },
    { loc: '/events', priority: '0.8', changefreq: 'weekly' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' }
  ];
  
  staticUrls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>https://wotnt.ru${url.loc}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  sermons.forEach(sermon => {
    xml += '  <url>\n';
    xml += `    <loc>https://wotnt.ru/sermons/${sermon.slug}</loc>\n`;
    xml += `    <lastmod>${(sermon.updated_at || sermon.created_at).split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  const publicDir = path.join(__dirname, 'public');
  const filePath = path.join(publicDir, 'sitemap.xml');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, xml);
  console.log(`✅ Sitemap saved to ${filePath}`);
  console.log(`📊 Total URLs: ${staticUrls.length + sermons.length}`);
}

generateSitemap().catch(console.error);
