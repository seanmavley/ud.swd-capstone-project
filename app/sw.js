self.addEventListener('install', function(event) {
  // pre cache a load of stuff:
  event.waitUntil(
    caches.open('CodeBySide').then(function(cache) {
      return cache.addAll([
        '/',
        'build/css/allvendor.min.css',
        'build/css/allvendor.css',
        'build/css/codeside.min.css',
        'build/css/codeside.css',
        'build/js/allvendor.min.js',
        'build/js/allvendor.js',
        'build/js/allcodemirror.min.js',
        'build/js/codeside.min.js',
        'build/js/codeside.js',
        'sw-register.js',
        'sw.js',
        'vendor/offline/offline.min.js',
        'vendor/localforage/dist/localforage.min.js',
        'vendor/localforage/dist/localforage.js',
        // Fonts
        'build/fonts/glyphicons-halflings-regular.eot',
        'build/fonts/glyphicons-halflings-regular.svg',
        'build/fonts/glyphicons-halflings-regular.ttf',
        'build/fonts/glyphicons-halflings-regular.woff',
        'build/fonts/glyphicons-halflings-regular.woff2',
        // HTMLs
        './components/admin/admin.html',
        './components/auth/templates/login.html',
        './components/auth/templates/register.html',
        './components/auth/templates/social.html',
        './components/auth/templates/verify-email.html',
        './components/codes/templates/all.html',
        './components/codes/templates/delete.html',
        './components/codes/templates/detail.html',
        './components/codes/templates/new.html',
        './components/home/home.html',
        // Includes 
        './pages/includes/footer.html',
        './pages/includes/menu.html',
        // Pages
        './pages/about.html',
        './pages/privacy-terms.html',
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
