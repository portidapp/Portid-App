import { URL } from 'url';

const targetUrl = process.argv[2];

if (!targetUrl) {
  console.log('\x1b[31mError: Please provide a URL to test.\x1b[0m');
  console.log('Usage: node scripts/test-og.js <URL>');
  console.log('Example: node scripts/test-og.js http://localhost:3000/p/albin-gheevarghese-rvnf');
  process.exit(1);
}

try {
  new URL(targetUrl);
} catch (e) {
  console.log('\x1b[31mError: Invalid URL format.\x1b[0m');
  process.exit(1);
}

console.log(`\n\x1b[36m⚡ Fetching and parsing Open Graph tags for:\x1b[0m ${targetUrl}\n`);

async function run() {
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_patched.html)'
      }
    });

    if (!res.ok) {
      console.log(`\x1b[31mHTTP Error: ${res.status} ${res.statusText}\x1b[0m`);
      process.exit(1);
    }

    const html = await res.text();
    
    // Parse tags
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '\x1b[31m[Missing]\x1b[0m';

    const tags = {};
    const metaRegex = /<meta\s+[^>]*?(?:name|property)="([^"]+)"\s+content="([^"]*)"[^>]*>/gi;
    let match;
    while ((match = metaRegex.exec(html)) !== null) {
      tags[match[1]] = match[2];
    }

    const canonicalMatch = html.match(/<link\s+[^>]*?rel="canonical"\s+href="([^"]+)"[^>]*>/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : '\x1b[31m[Missing]\x1b[0m';

    console.log('\x1b[32m=== Standard Meta Tags ===\x1b[0m');
    console.log(`Title:       \x1b[1m${title}\x1b[0m`);
    console.log(`Description: ${tags['description'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log(`Canonical:   ${canonical}`);
    console.log('');

    console.log('\x1b[32m=== Open Graph Tags ===\x1b[0m');
    console.log(`og:title:       ${tags['og:title'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log(`og:description: ${tags['og:description'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log(`og:image:       ${tags['og:image'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log(`og:type:        ${tags['og:type'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log(`og:url:         ${tags['og:url'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log('');

    console.log('\x1b[32m=== Twitter Card Tags ===\x1b[0m');
    console.log(`twitter:card:        ${tags['twitter:card'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log(`twitter:title:       ${tags['twitter:title'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log(`twitter:description: ${tags['twitter:description'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log(`twitter:image:       ${tags['twitter:image'] || '\x1b[31m[Missing]\x1b[0m'}`);
    console.log('');

    console.log('\x1b[35m✨ Verification complete!\x1b[0m\n');
  } catch (err) {
    console.error('\x1b[31mFailed to fetch/parse URL:\x1b[0m', err.message);
  }
}

run();
