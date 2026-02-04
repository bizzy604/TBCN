import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Cache Service
 * Provides a clean interface for cache operations
 */
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  /**
   * Get a cached value
   */
  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  /**
   * Set a cached value
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl ? ttl * 1000 : undefined);
  }

  /**
   * Delete a cached value
   */
  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  /**
   * Delete all cached values matching a pattern
   */
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.cache.store.keys(pattern);
    if (keys && keys.length > 0) {
      await Promise.all(keys.map((key) => this.cache.del(key)));
    }
  }

  /**
   * Get or set cache (cache-aside pattern)
   * @param key Cache key
   * @param factory Function to fetch value if not cached
   * @param ttl Time to live in seconds
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Clear the entire cache
   */
  async reset(): Promise<void> {
    await this.cache.reset();
  }

  // ============================================
  // Common Cache Key Generators
  // ============================================

  static userKey(userId: string): string {
    return `user:${userId}`;
  }

  static userProfileKey(userId: string): string {
    return `user:${userId}:profile`;
  }

  static programKey(programId: string): string {
    return `program:${programId}`;
  }

  static programCatalogKey(page: number, limit: number): string {
    return `programs:catalog:${page}:${limit}`;
  }

  static enrollmentKey(enrollmentId: string): string {
    return `enrollment:${enrollmentId}`;
  }

  static sessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }
}
