import { NamingVariants } from '../utils/naming.js';

export const cacheTemplate = (
  naming: NamingVariants,
  strategy: string,
  ttl: number,
  tags: string[]
): string => {
  const strategyCode = getStrategyCode(strategy, naming, ttl);
  const tagsCode = tags.length > 0
    ? `tags: [${tags.map(t => `'${t}'`).join(', ')}]`
    : '';

  return `import { CacheService } from './cache.interface';

/**
 * ${naming.pascal} Cache
 *
 * Strategy: ${strategy}
 * Default TTL: ${ttl} seconds
 * ${tags.length > 0 ? `Tags: ${tags.join(', ')}` : ''}
 */
export class ${naming.pascal}Cache<T> {
  constructor(
    private readonly cache: CacheService,
    private readonly keyPrefix: string = '${naming.kebab}'
  ) {}

  private getKey(id: string): string {
    return \`\${this.keyPrefix}:\${id}\`;
  }
${strategyCode}

  /**
   * Invalidate cached item
   */
  async invalidate(id: string): Promise<void> {
    await this.cache.delete(this.getKey(id));
  }

  /**
   * Invalidate all items with specific tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    await this.cache.deleteByTag(tag);
  }

  /**
   * Check if item exists in cache
   */
  async exists(id: string): Promise<boolean> {
    return this.cache.exists(this.getKey(id));
  }

  /**
   * Get remaining TTL
   */
  async getTTL(id: string): Promise<number> {
    return this.cache.ttl(this.getKey(id));
  }
}
`;
};

const getStrategyCode = (strategy: string, naming: NamingVariants, ttl: number): string => {
  switch (strategy) {
    case 'cache-aside':
      return `
  /**
   * Get item with cache-aside strategy
   * - Try cache first
   * - On miss, fetch from source and cache
   */
  async get(id: string, fetcher: () => Promise<T>): Promise<T> {
    const key = this.getKey(id);

    // Try cache first
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const data = await fetcher();

    // Store in cache
    await this.cache.set(key, data, { ttl: ${ttl} });

    return data;
  }

  /**
   * Set item in cache
   */
  async set(id: string, data: T, customTtl?: number): Promise<void> {
    await this.cache.set(this.getKey(id), data, { ttl: customTtl ?? ${ttl} });
  }`;

    case 'write-through':
      return `
  /**
   * Get item from cache
   */
  async get(id: string): Promise<T | null> {
    return this.cache.get<T>(this.getKey(id));
  }

  /**
   * Set item with write-through strategy
   * - Write to cache immediately
   * - Then write to source
   */
  async set(
    id: string,
    data: T,
    writer: (data: T) => Promise<void>
  ): Promise<void> {
    const key = this.getKey(id);

    // Write to cache first
    await this.cache.set(key, data, { ttl: ${ttl} });

    // Then write to source
    await writer(data);
  }

  /**
   * Update with write-through
   */
  async update(
    id: string,
    updater: (current: T | null) => Promise<T>,
    writer: (data: T) => Promise<void>
  ): Promise<T> {
    const current = await this.get(id);
    const updated = await updater(current);
    await this.set(id, updated, writer);
    return updated;
  }`;

    case 'stale-while-revalidate':
      return `
  /**
   * Get item with stale-while-revalidate strategy
   * - Return cached data immediately (even if stale)
   * - Refresh in background if TTL exceeded
   */
  async get(
    id: string,
    fetcher: () => Promise<T>,
    staleThreshold: number = ${Math.floor(ttl / 2)}
  ): Promise<T> {
    const key = this.getKey(id);

    const cached = await this.cache.get<{ data: T; fetchedAt: number }>(key);

    if (cached) {
      const age = (Date.now() - cached.fetchedAt) / 1000;

      // If within stale threshold, return immediately
      if (age < staleThreshold) {
        return cached.data;
      }

      // If stale but exists, return and refresh in background
      this.refreshInBackground(id, fetcher);
      return cached.data;
    }

    // No cache, fetch synchronously
    return this.refresh(id, fetcher);
  }

  /**
   * Refresh cache synchronously
   */
  private async refresh(id: string, fetcher: () => Promise<T>): Promise<T> {
    const data = await fetcher();
    await this.cache.set(this.getKey(id), {
      data,
      fetchedAt: Date.now()
    }, { ttl: ${ttl * 2} }); // Store longer since we handle staleness
    return data;
  }

  /**
   * Refresh cache in background (non-blocking)
   */
  private refreshInBackground(id: string, fetcher: () => Promise<T>): void {
    this.refresh(id, fetcher).catch(error => {
      console.error('Background refresh failed:', error);
    });
  }

  /**
   * Force refresh
   */
  async forceRefresh(id: string, fetcher: () => Promise<T>): Promise<T> {
    return this.refresh(id, fetcher);
  }`;

    default:
      return `
  /**
   * Get item from cache
   */
  async get(id: string): Promise<T | null> {
    return this.cache.get<T>(this.getKey(id));
  }

  /**
   * Set item in cache
   */
  async set(id: string, data: T, customTtl?: number): Promise<void> {
    await this.cache.set(this.getKey(id), data, { ttl: customTtl ?? ${ttl} });
  }`;
  }
};
