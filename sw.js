const precacheURLs = [
	'/',
	'/index.html',
	'/index.css',
	'/index.js',
	'/data.js',
	'/favicon.ico',
	'/images/icon-192.png',
	'/images/icon-512.png',
	'/images/icon.svg',
	'/images/infinity.svg',
	'/images/hand.svg',
	'/images/qrcode.gif',
	'/images/paypal.svg',
];

// Service worker installation
self.addEventListener('install', e => {
	e.waitUntil(
		caches.open('odd-or-even').then(cache => {
			return cache.addAll(precacheURLs)
				.then(() => self.skipWaiting());
		})
	);
});

// Service worker activation
self.addEventListener('activate', e => {
	e.waitUntil(self.clients.claim());
});

// Service worker fetch
self.addEventListener('fetch', e => {
	// Respond with cache
	e.respondWith(
		caches.open('odd-or-even').then(cache => {
			return cache.match(e.request);
		})
	);
	// Update cache
	e.waitUntil(
		caches.open('odd-or-even').then(cache => {
			return fetch(e.request).then(response => {
				return cache.put(e.request, response);
			});
		})
	);
});
