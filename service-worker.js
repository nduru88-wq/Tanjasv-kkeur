self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("alarm-app").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/lyd1.mp3",
        "/manifest.json"
      ]);
    })
  );
});
