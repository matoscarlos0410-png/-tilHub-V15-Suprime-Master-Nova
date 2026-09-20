const CACHE = "utilhub-v15-nova-flow-2";

const CORE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest"
];

/* INSTALAR */

self.addEventListener("install", event => {

  event.waitUntil(

    caches
      .open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())

  );

});

/* ACTIVAR */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches
      .keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});

/* PETICIONES */

self.addEventListener("fetch", event => {

  if (
    event.request.method !== "GET"
  ) {
    return;
  }

  const requestURL =
    new URL(event.request.url);

  if (
    requestURL.origin !==
    self.location.origin
  ) {
    return;
  }

  event.respondWith(

    caches
      .match(event.request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(event.request)
          .then(response => {

            if (
              response &&
              response.ok
            ) {

              const copy =
                response.clone();

              caches
                .open(CACHE)
                .then(cache => {
                  cache.put(
                    event.request,
                    copy
                  );
                });

            }

            return response;

          })
          .catch(() =>
            caches.match("./index.html")
          );

      })

  );

});
