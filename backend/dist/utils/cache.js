"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
/**
 * Caching Service Abstraction Layer
 * Provides standard Cache interfaces allowing future Redis plug-in replacements.
 */
class CacheService {
    store = new Map();
    /**
     * Get cached value by key. Auto-deletes expired records.
     */
    async get(key) {
        const item = this.store.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }
    /**
     * Set cached value with an optional TTL (Time To Live) in seconds.
     */
    async set(key, value, ttlSeconds = 300) {
        const expiry = Date.now() + ttlSeconds * 1000;
        this.store.set(key, { value, expiry });
    }
    /**
     * Delete key from cache
     */
    async del(key) {
        this.store.delete(key);
    }
    /**
     * Flush/clear all items in cache
     */
    async flush() {
        this.store.clear();
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
exports.default = exports.cacheService;
