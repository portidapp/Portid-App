import http from 'http';
import { URL } from 'url';
import handler from '../api/profile.js';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  
  // Set up Vercel-like request properties
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());
  
  // Set up Vercel-like response helpers
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  
  res.send = (body) => {
    res.end(body);
    return res;
  };

  res.json = (json) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(json));
    return res;
  };

  // Route /p/:slug to the handler
  const pMatch = parsedUrl.pathname.match(/^\/p\/([^/]+)$/);
  if (pMatch) {
    req.query.slug = pMatch[1];
    try {
      await handler(req, res);
    } catch (err) {
      console.error('Handler error:', err);
      res.statusCode = 500;
      res.end('Handler Error');
    }
  } else {
    // For anything else, fall back to returning the index.html without slug
    try {
      req.query.slug = undefined;
      await handler(req, res);
    } catch (err) {
      console.error('Fallback error:', err);
      res.statusCode = 500;
      res.end('Fallback Error');
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n\x1b[36m⚡ Local test server running at http://localhost:${PORT}\x1b[0m`);
  console.log(`To verify OG tags, run: \x1b[33mnode scripts/test-og.js http://localhost:${PORT}/p/some-slug\x1b[0m\n`);
});
