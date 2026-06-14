var CACHE_NAME = 'pingo-v2';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

// Instala e cacheia assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Estratégia: Cache First, fallback para rede
self.addEventListener('fetch', function(event) {
  // Ignora requisições de análise/telemetria
  if (event.request.url.indexOf('google') !== -1 ||
      event.request.url.indexOf('gstatic') !== -1 ||
      event.request.url.indexOf('unsplash') !== -1 ||
      event.request.url.indexOf('cdnjs') !== -1) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Cacheia apenas respostas válidas do mesmo domínio
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback para navegação
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});