import { LRUCache } from "lru-cache";

export const appCache = new LRUCache<string, {}>({
  max: 2000,
  ttl: 1000 * 60 * 30,
  allowStale: false,
});

const inFlight = new Map<string, Promise<{}>>();

export async function getOrSetCache<T extends {}>(
  key: string,
  fn: () => Promise<T>,
  ttl = 1000 * 60 * 30,
): Promise<T> {
  const cached = appCache.get(key) as T | undefined;
  if (cached !== undefined) {
    return cached;
  }

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const producerPromise = fn()
    .then((value) => {
      appCache.set(key, value, { ttl });
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, producerPromise);
  return producerPromise;
}
