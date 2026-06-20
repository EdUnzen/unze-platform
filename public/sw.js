/* UNZE PWA v5 — SWR Shell, Background Sync, Discover warmup */
const SHELL_CACHE = "unze-shell-v5";
const ASSET_CACHE = "unze-assets-v5";
const PREFETCH_PATH = "/api/pwa/prefetch";
const SHELL_API = "/api/pwa/shell";
const SYNC_TAG = "unze-pwa-warmup";

const SHELL_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/brand/unze-logo.png",
  "/brand/unze-home-hero.png",
  "/brand/unze-guest-hero.png",
];

const WARM_NAV_PATHS = ["/", "/discover", "/profile", "/favorites"];

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
          .filter((k) => !["unze-shell-v5", "unze-assets-v5"].includes(k))
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

function staleWhileRevalidateNavigation(request) {
  return caches.open(SHELL_CACHE).then(async (cache) => {
    const cached = await cache.match(request);
    const network = fetch(request)
      .then((res) => {
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
      .catch(() => cached);
    return cached || network;
  });
}

async function runWarmupSync() {
  const urls = [
    PREFETCH_PATH,
    SHELL_API,
    "/discover",
    "/discover?tab=events",
    "/profile",
    "/favorites",
  ];
  await Promise.allSettled(
    urls.map((path) =>
      fetch(path, { credentials: "include", cache: "no-store" }).catch(() => {}),
    ),
  );
}

self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(runWarmupSync());
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === PREFETCH_PATH || url.pathname === SHELL_API) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          cachePut(event.request, res);
          if ("sync" in self.registration) {
            self.registration.sync.register(SYNC_TAG).catch(() => {});
          }
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
    if (isWarmNav) {
      event.respondWith(staleWhileRevalidateNavigation(event.request));
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
