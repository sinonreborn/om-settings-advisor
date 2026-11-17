// Service worker for OM Settings Advisor.
//
// The page shell (index.html) is always fetched from the network first, so a new
// deploy shows up on the next visit without a hard refresh. The cached copy is only
// used when the network is down or too slow. Hashed build files under /assets/ never
// change, so those are served from the cache once downloaded.
//
// Everything else (the /api/ proxy, weather, map tiles, fonts) is left to the browser.

const CACHE_NAME = 'om-advisor-v2';
const SHELL_KEY = '/';
const SHELL_TIMEOUT_MS = 5000;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const stale = keys.filter((k) => k !== CACHE_NAME);
    await Promise.all(stale.map((k) => caches.delete(k)));
    await self.clients.claim();

    // Upgrading from the old worker: that one served a cached page shell forever,
    // which could point at a build file that no longer exists (blank page).
    // Reload any open window once so it picks up the current shell.
    // Not awaited: the reload is served by this worker's fetch handler, which only
    // starts once activation has finished, so waiting on it here would deadlock.
    if (stale.length) {
      const windows = await self.clients.matchAll({ type: 'window' });
      windows.forEach((client) => {
        if (client.navigate) client.navigate(client.url).catch(() => {});
      });
    }
  })());
});

// Keep only the build files the current shell refers to.
async function pruneAssets(cache, shellHtml) {
  const wanted = new Set(
    (shellHtml.match(/\/assets\/[^"'\s>]+/g) || []).map((p) => new URL(p, self.location.origin).href)
  );
  if (!wanted.size) return;
  const requests = await cache.keys();
  await Promise.all(
    requests
      .filter((r) => new URL(r.url).pathname.startsWith('/assets/') && !wanted.has(r.url))
      .map((r) => cache.delete(r))
  );
}

async function shellNetworkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(SHELL_KEY);

  const fromNetwork = (async () => {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(SHELL_KEY, response.clone());
      response.clone().text().then((html) => pruneAssets(cache, html)).catch(() => {});
    }
    return response;
  })();

  if (!cached) return fromNetwork;

  // With a cached copy available, don't wait forever on a weak signal.
  fromNetwork.catch(() => {});
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), SHELL_TIMEOUT_MS));
  try {
    return (await Promise.race([fromNetwork, timeout])) || cached;
  } catch {
    return cached;
  }
}

async function assetCacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(shellNetworkFirst(request));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(assetCacheFirst(request));
  }
});
