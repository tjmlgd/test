/* global Ultraviolet */
self.__uv$config = {
  prefix: '/service/',
  bare: 'https://bare.benroberts.net/',
  encodeUrl: (url) => {
    if (!url) return url;
    return encodeURIComponent(
      url.toString().split('').map((char, ind) => 
        ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char
      ).join('')
    );
  },
  decodeUrl: (url) => {
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
  },
  handler: '/uv/uv.handler.js',
  client: '/uv/uv.client.js',
  bundle: '/uv/uv.bundle.js',
  config: '/uv/uv.config.js',
  sw: '/uv/uv.sw.js',
};
