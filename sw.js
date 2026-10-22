/* global UVServiceWorker, Ultraviolet */

// Dynamically resolve the directory path (e.g. /gh/tjmlgd/test@main/)
const basePath = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);

// Fallback XOR encoding codecs to guarantee safe execution
const encodeUrl = (url) => {
  if (!url) return url;
  return encodeURIComponent(
    url.toString().split('').map((char, ind) => 
      ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char
    ).join('')
  );
};

const decodeUrl = (url) => {
  if (!url) return url;
  let [input, ...search] = url.split('?');
  return (
    decodeURIComponent(input)
      .split('')
      .map((char, ind) => 
        ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char
      )
      .join('') + (search.length ? '?' + search.join('?') : '')
  );
};

// 1. Import local bundle from your repo's uv folder
importScripts(basePath + 'uv/uv.bundle.js');

// 2. Define the full config UVServiceWorker requires
self.__uv$config = {
  prefix: basePath + 'service/',
  bare: 'https://bare.benroberts.net/',
  encodeUrl: (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor) ? Ultraviolet.codec.xor.encode : encodeUrl,
  decodeUrl: (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor) ? Ultraviolet.codec.xor.decode : decodeUrl,
  handler: basePath + 'uv/uv.handler.js',
  client: basePath + 'uv/uv.client.js',
  bundle: basePath + 'uv/uv.bundle.js',
  config: basePath + 'uv/uv.config.js',
  sw: basePath + 'uv/uv.sw.js',
};

// 3. Import UV service worker handler
importScripts(basePath + 'uv/uv.sw.js');

// 4. Initialize Ultraviolet worker
const uv = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(location.origin + __uv$config.prefix)) {
    event.respondWith(uv.fetch(event));
  }
});