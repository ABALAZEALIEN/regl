const CACHE_NAME = "regli-takip-v1";
const assets = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./images/arkaplan.png",
  "./images/biz.jpg"
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});