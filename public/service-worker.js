const CACHE_NAME = 'default-cache';

self.addEventListener('install', function (evt) {
	const FILES_TO_CACHE = [
		'/offline.html',
		'/icons/favicon.png',
		'/css/bootstrap.min.css',
		'/css/index.css',
		'/css/bootstrap.dark.min.css'
	];

	evt.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			  console.log('[ServiceWorker] Pre-caching offline page');
			  return cache.addAll(FILES_TO_CACHE);
		})
	);

	self.skipWaiting();
})

self.addEventListener('fetch', function (evt) {
	console.log('[ServiceWorker] Fetch', evt.request.url);
	if (evt.request.mode !== 'navigate') {
		// Not a page navigation, bail.
		return;
	  }
	  evt.respondWith(
		  fetch(evt.request)
			  .catch(() => {
				return caches.open(CACHE_NAME)
					.then((cache) => {
					  return cache.match('offline.html');
					});
			  })
	  );
})

self.addEventListener('activate', function (evt) {
	evt.waitUntil(
		caches.keys().then((keyList) => {
		  return Promise.all(keyList.map((key) => {
			if (key !== CACHE_NAME) {
			  console.log('[ServiceWorker] Removing old cache', key);
			  return caches.delete(key);
			}
		  }));
		})
	);

	self.clients.claim();
})