/* UNZE PWA v3 — Shell, Assets, Navigation SWR, Bilder */
const SHELL_CACHE = "unze-shell-v3";
const ASSET_CACHE = "unze-assets-v3";
const PREFETCH_PATH = "/api/pwa/prefetch";

const SHELL_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const WARM_NAV_PATHS = ["/discover", "/profile", "/favorites"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !["unze-shell-v3", "unze-assets-v3"].includes(k))
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

function cachePut(request, response) {
  if (!response || !response.ok) return;
  const clone = response.clone();
  caches.open(ASSET_CACHE).then((cache) => cache.put(request, clone));
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === PREFETCH_PATH) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          cachePut(event.request, res);
          return res;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((res) => {
            cachePut(event.request, res);
            return res;
          }),
      ),
    );
    return;
  }

  if (event.request.mode === "navigate") {
    const isWarmNav = WARM_NAV_PATHS.some(
      (p) => url.pathname === p || url.pathname.startsWith(p + "/"),
    );
    if (isWarmNav || url.pathname === "/") {
      event.respondWith(
        fetch(event.request)
          .then((res) => {
            if (res.ok) {
              caches.open(SHELL_CACHE).then((c) => c.put(event.request, res.clone()));
            }
            return res;
          })
          .catch(() => caches.match(event.request)),
      );
      return;
    }
  }

  if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|avif|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((res) => {
            cachePut(event.request, res);
            return res;
          }),
      ),
    );
  }
});
