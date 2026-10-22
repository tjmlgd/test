/* global UVServiceWorker */
importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3.2.11/dist/uv.bundle.js');

self.__uv$config = {
  prefix: '/service/',
  bare: 'https://bare.benroberts.net/',
};

importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3.2.11/dist/uv.sw.js');

const uv = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(location.origin + __uv$config.prefix)) {
    event.respondWith(uv.fetch(event));
  }
});