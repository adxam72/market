import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from 'vite';
import { publicPages, SITE_URL, SITE_IMAGE, structuredData } from '../src/lib/seo.ts';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const template = await readFile('dist/index.html', 'utf8');
if (!template.includes('<!-- seo:start -->')) throw new Error('SEO template markers are missing');
const verification = env.GOOGLE_SITE_VERIFICATION;
if (verification && !/^[A-Za-z0-9_-]+$/.test(verification)) throw new Error('Invalid Google verification token');

async function products() {
  if (env.SEO_SKIP_PRODUCT_FETCH === '1') return []; // Offline CI only; production must fetch the public catalog.
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) return [];
  const all = [];
  for (let offset = 0; ; offset += 500) {
    const url = new URL('/rest/v1/products', env.VITE_SUPABASE_URL);
    url.search = new URLSearchParams({ select: 'slug,name,description,images', is_active: 'eq.true', order: 'slug.asc', limit: '500', offset: String(offset) }).toString();
    const response = await fetch(url, { headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Public product sitemap query failed (${response.status})`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Invalid public product response');
    all.push(...batch);
    if (batch.length < 500) return all;
  }
}

const pages = { ...publicPages };
for (const product of await products()) {
  const slug = product.slug;
  if (typeof slug !== 'string' || !slug || slug === '.' || slug === '..' || /[\\/]/.test(slug)) throw new Error('Invalid product slug in sitemap');
  pages[`/product/${encodeURIComponent(slug)}`] = {
    title: `${product.name} — DTPI Market, Denov`,
    description: String(product.description || `${product.name}. DTPI Marketdagi mahalliy mahsulot. Xizmat hududi: DTPI va Denovdagi yaqin atrof.`).replace(/\s+/g, ' ').slice(0, 170),
    image: product.images?.find(image => typeof image === 'string' && /^https?:\/\//.test(image)) || SITE_IMAGE,
  };
}

for (const [route, page] of Object.entries(pages)) {
  const canonical = `${SITE_URL}${route}`;
  const image = page.image || SITE_IMAGE;
  const data = structuredData(route);
  const metadata = `<!-- seo:start -->
    <title>${escape(page.title)}</title>
    <meta name="description" content="${escape(page.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${escape(canonical)}" />
    <meta property="og:title" content="${escape(page.title)}" />
    <meta property="og:description" content="${escape(page.description)}" />
    <meta property="og:url" content="${escape(canonical)}" />
    <meta property="og:image" content="${escape(image)}" />
    <meta name="twitter:title" content="${escape(page.title)}" />
    <meta name="twitter:description" content="${escape(page.description)}" />
    <meta name="twitter:image" content="${escape(image)}" />
    ${data ? `<script id="site-structured-data" type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>` : ''}
    ${verification ? `<meta name="google-site-verification" content="${escape(verification)}" />` : ''}
    <!-- seo:end -->`;
  const html = template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, () => metadata);
  const output = route === '/' ? 'dist/index.html' : path.join('dist', `${route.slice(1)}.html`);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, html);
}

const urls = Object.keys(pages).map(route => `<url><loc>${escape(`${SITE_URL}${route}`)}</loc></url>`).join('\n');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`SEO: ${Object.keys(pages).length} public URLs; ${Object.keys(pages).filter(route => route.startsWith('/product/')).length} products. Metadata and sitemap generated.`);
