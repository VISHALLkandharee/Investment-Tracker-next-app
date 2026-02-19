// src/lib/utils/cache.ts
// A generic in-memory cache with TTL (Time To Live) support.
// Works great in serverless environments like Vercel for short-lived caching.

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

class CacheService {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Get a cached value by key. Returns null if expired or not found.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set a value in the cache with a TTL in seconds.
   * @param key - Cache key
   * @param value - Value to store
   * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiry });
  }

  /**
   * Delete a specific key from the cache.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get the number of entries currently in the cache.
   */
  get size(): number {
    return this.store.size;
  }
}

// Singleton: Use a global variable so the cache survives hot-reloads in development
const globalForCache = globalThis as unknown as { cache: CacheService };
export const cache = globalForCache.cache ?? new CacheService();

if (process.env.NODE_ENV !== "production") {
  globalForCache.cache = cache;
}
