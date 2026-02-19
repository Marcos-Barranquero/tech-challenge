import { LRUCache } from "lru-cache";

export const appCache = new LRUCache<string, {}>({
  max: 2000,
  ttl: 1000 * 60 * 30,
  allowStale: false,
});

export async function getOrSetCache<T extends {}>(
  key: string,
  fn: () => Promise<T>,
  ttl = 1000 * 60 * 30,
): Promise<T> {
  const cached = appCache.get(key) as T | undefined;
  if (cached !== undefined) {
    return cached;
  }

  const value = await fn();
  appCache.set(key, value, { ttl });
  return value;
}
