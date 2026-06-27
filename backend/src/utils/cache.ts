/**
 * Caching Service Abstraction Layer
 * Provides standard Cache interfaces allowing future Redis plug-in replacements.
 */
export class CacheService {
  private store = new Map<string, { value: any; expiry: number }>();

  /**
   * Get cached value by key. Auto-deletes expired records.
   */
  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Set cached value with an optional TTL (Time To Live) in seconds.
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiry });
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  /**
   * Flush/clear all items in cache
   */
  async flush(): Promise<void> {
    this.store.clear();
  }
}

export const cacheService = new CacheService();
export default cacheService;
