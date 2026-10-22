/* global UVServiceWorker */
importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3.2.11/dist/uv.bundle.js');

// Automatically detect the repository subfolder path on jsDelivr or GitHub
const basePath = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);

self.__uv$config = {
  prefix: basePath + 'service/',
  bare: 'https://bare.benroberts.net/',
};

importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3.2.11/dist/uv.sw.js');

const uv = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(location.origin + __uv$config.prefix)) {
    event.respondWith(uv.fetch(event));
  }
});