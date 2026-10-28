/* sw.js — byte relay for the proxy page.
   Provides:  ./raw/?u=<encoded-url>        append &dl=1 to force download */
const PROXIES = [
  { name: 'allorigins',  url: 'https://api.allorigins.win/raw?url={enc}' },
  { name: 'corsproxy.io',url: 'https://corsproxy.io/?url={enc}' },
  { name: 'codetabs',    url: 'https://api.codetabs.com/v1/proxy?quest={enc}' },
  { name: 'cors.lol',    url: 'https://api.cors.lol/?url={enc}' },
  { name: 'cors.eu.org', url: 'https://cors.eu.org/{raw}' },
  { name: 'thingproxy',  url: 'https://thingproxy.freeboard.io/fetch/{raw}' },
  { name: 'workers.dev', url: 'https://test.cors.workers.dev/?{raw}' },
  { name: 'yacdn',       url: 'https://yacdn.org/proxy/{raw}' },
  { name: 'isomorphic',  url: 'https://cors.isomorphic-git.org/{raw}' },
  { name: 'jina-text',   url: 'https://r.jina.ai/{raw}' }
];

const MIME = {
  js:'text/javascript',mjs:'text/javascript',css:'text/css',map:'application/json',json:'application/json',
  html:'text/html; charset=utf-8',htm:'text/html; charset=utf-8',xml:'application/xml',svg:'image/svg+xml',
  txt:'text/plain; charset=utf-8',md:'text/markdown; charset=utf-8',vtt:'text/vtt',pdf:'application/pdf',
  png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',avif:'image/avif',ico:'image/x-icon',
  mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime',
  mp3:'audio/mpeg',m4a:'audio/mp4',ogg:'audio/ogg',wav:'audio/wav',
  woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf',otf:'font/otf',wasm:'application/wasm'
};

const build = (t, u) => t.replace('{enc}', encodeURIComponent(u)).replace('{raw}', u);
const guess = (u) => {
  const p = u.split('?')[0].split('#')[0];
  return MIME[p.slice(p.lastIndexOf('.') + 1).toLowerCase()] || 'application/octet-stream';
};

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' && e.request.method !== 'HEAD') return;
  const u = new URL(e.request.url);
  const scope = new URL(self.registration.scope);
  if (u.origin !== scope.origin) return;
  if (!u.pathname.startsWith(scope.pathname.replace(/\/+$/, '/') + 'raw/')) return;
  e.respondWith(handle(u));
});

async function handle(u) {
  const target = u.searchParams.get('u');
  if (!target) return new Response('missing ?u=', { status: 400 });

  let r = null;
  try {
    const d = await fetch(target, { redirect: 'follow', credentials: 'omit' });
    if (d.type !== 'opaque') r = d;
  } catch (err) {}
  if (!r) for (const p of PROXIES) {
    try { const x = await fetch(build(p.url, target), { redirect: 'follow' }); if (x.ok) { r = x; break; } }
    catch (err) {}
  }
  if (!r) return new Response('all routes failed', { status: 502 });

  const buf = await r.arrayBuffer();
  const h = new Headers({
    'content-type': r.headers.get('content-type') || guess(target),
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=300',
    'x-proxied-by': 'sw.js'
  });
  if (u.searchParams.has('dl')) h.set('content-disposition', 'attachment');
  return new Response(buf, { status: 200, headers: h });
}
