self.addEventListener('install', function(event) {
  // pre cache a load of stuff:
  event.waitUntil(
    caches.open('CodeBySide').then(function(cache) {
      return cache.addAll([
        '/',
        'build/css/allvendor.min.css',
        'build/css/codeside.min.css',
        'build/js/allvendor.min.js',
        'build/js/allcodemirror.min.js',
        'build/js/codeside.min.js',
        'build/fonts/glyphicons-halflings-regular.eot',
        'build/fonts/glyphicons-halflings-regular.svg',
        'build/fonts/glyphicons-halflings-regular.ttf',
        'build/fonts/glyphicons-halflings-regular.woff',
        'build/fonts/glyphicons-halflings-regular.woff2'
      ]);
    })
  )
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      return cachedResponse || fetch(event.request);
    })
  );
});
