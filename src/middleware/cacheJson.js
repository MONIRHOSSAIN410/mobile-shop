/**
 * A tiny in-process cache for the public, read-only endpoints.
 *
 * The catalogue changes a few times a day, but a single product page asks for
 * the listing, the facets, the categories and the brands — and Next.js asks
 * again on every dev render. Each of those is a round trip to Atlas, which from
 * Bangladesh is a few hundred milliseconds of pure latency per call. Holding
 * the answers for half a minute turns the second visit into microseconds.
 *
 * Deliberately simple: one Map, no dependency, cleared whenever anything is
 * written through the same router.
 */
const store = new Map();
const MAX_ENTRIES = 300;

export function cacheJson(seconds = 30) {
  const ttl = seconds * 1000;

  return (req, res, next) => {
    // Any write invalidates everything — the catalogue is small.
    if (req.method !== "GET") {
      store.clear();
      return next();
    }

    const key = req.originalUrl;
    const hit = store.get(key);
    const now = Date.now();

    if (hit && hit.expires > now) {
      res.set("cache-control", `public, max-age=${seconds}`);
      res.set("x-cache", "HIT");
      return res.json(hit.body);
    }

    const sendJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        if (store.size >= MAX_ENTRIES) {
          // Oldest first — Map keeps insertion order.
          for (const staleKey of store.keys()) {
            store.delete(staleKey);
            if (store.size < MAX_ENTRIES / 2) break;
          }
        }
        store.set(key, { body, expires: Date.now() + ttl });
      }
      res.set("cache-control", `public, max-age=${seconds}`);
      res.set("x-cache", "MISS");
      return sendJson(body);
    };

    next();
  };
}

export function clearJsonCache() {
  store.clear();
}
