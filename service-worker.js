const CACHE_NAME = "alarm-app-v7";

// Alle filer der skal caches
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./lyd1.mp3",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALL – cacher filer
self.addEventListener("install", (event) => {
  console.log("Service Worker: Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE – rydder gammel cache
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Sletter gammel cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH – henter fra cache først, ellers net
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
