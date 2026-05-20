const CACHE_NAME = "assessify-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/logo192.png",
  "/logo512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Do not cache API responses to keep data fresh
  if (url.pathname.includes("/backend/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});