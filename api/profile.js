import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually in local development if environment variables are not populated
if (!process.env.VITE_SUPABASE_URL) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    console.warn('Failed to parse .env file:', e);
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get slug from query parameters (Vercel routes /p/:slug to /api/profile?slug=:slug)
  const { slug } = req.query;

  // 1. Read index.html from dist (production) or root (local dev)
  let html = '';
  const distPath = path.join(process.cwd(), 'dist', 'index.html');
  const rootPath = path.join(process.cwd(), 'index.html');

  try {
    if (fs.existsSync(distPath)) {
      html = fs.readFileSync(distPath, 'utf8');
    } else if (fs.existsSync(rootPath)) {
      html = fs.readFileSync(rootPath, 'utf8');
    } else {
      return res.status(500).send('Entry HTML file not found');
    }
  } catch (err) {
    console.error('Error reading index.html:', err);
    return res.status(500).send('Internal Server Error');
  }

  if (!slug) {
    // Return standard index.html if no slug is provided
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  try {
    // 2. Fetch profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('brand_name, tagline, description, logo_url')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error:', error);
      // Fallback: return default html
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    if (!profile) {
      // Profile not found: inject "Profile Not Found" metadata
      const notFoundHtml = injectMetadata(html, {
        title: 'Profile Not Found | Portid',
        description: 'This Portid profile does not exist.',
        image: `https://${req.headers.host || 'portid.in'}/og-image.png`,
        url: `https://${req.headers.host || 'portid.in'}/p/${slug}`
      });
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(notFoundHtml);
    }

    // 3. Prepare metadata values
    const title = `${profile.brand_name} | Portid`;
    const description = profile.tagline || profile.description || 'View this Portid profile.';
    
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'portid.in';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const profileUrl = `${protocol}://${host}/p/${slug}`;

    let imageUrl = profile.logo_url;
    if (!imageUrl) {
      imageUrl = `${protocol}://${host}/og-image.png`;
    } else if (!imageUrl.startsWith('http')) {
      imageUrl = `${protocol}://${host}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    // 4. Inject metadata
    const injectedHtml = injectMetadata(html, {
      title,
      description,
      image: imageUrl,
      url: profileUrl
    });

    res.setHeader('Content-Type', 'text/html');
    // Set caching headers: cache at edge for 1 minute, but revalidate
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    return res.status(200).send(injectedHtml);

  } catch (err) {
    console.error('Error serving profile preview:', err);
    // Fallback: return default html
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }
}

function injectMetadata(html, data) {
  // Strip existing title & meta tags to avoid duplicates
  let cleanedHtml = html
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta[^>]*?name="description"[^>]*?>/gi, '')
    .replace(/<meta[^>]*?property="og:title"[^>]*?>/gi, '')
    .replace(/<meta[^>]*?property="og:description"[^>]*?>/gi, '')
    .replace(/<meta[^>]*?property="og:image"[^>]*?>/gi, '')
    .replace(/<meta[^>]*?property="og:type"[^>]*?>/gi, '')
    .replace(/<meta[^>]*?property="og:url"[^>]*?>/gi, '')
    .replace(/<meta[^>]*?name="twitter:card"[^>]*?>/gi, '')
    .replace(/<meta[^>]*?name="twitter:title"[^>]*?>/gi, '')
    .replace(/<meta[^>]*?name="twitter:description"[^>]*?>/gi, '')
    .replace(/<meta[^>]*?name="twitter:image"[^>]*?>/gi, '')
    .replace(/<link[^>]*?rel="canonical"[^>]*?>/gi, '');

  const newTags = `
  <title>${escapeHtml(data.title)}</title>
  <meta name="description" content="${escapeHtml(data.description)}" />
  <link rel="canonical" href="${escapeHtml(data.url)}" />
  
  <meta property="og:title" content="${escapeHtml(data.title)}" />
  <meta property="og:description" content="${escapeHtml(data.description)}" />
  <meta property="og:image" content="${escapeHtml(data.image)}" />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="${escapeHtml(data.url)}" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(data.title)}" />
  <meta name="twitter:description" content="${escapeHtml(data.description)}" />
  <meta name="twitter:image" content="${escapeHtml(data.image)}" />`;

  return cleanedHtml.replace(/<head>/i, `<head>${newTags}`);
}
