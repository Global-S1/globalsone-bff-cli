import { NamingVariants } from '../utils/naming.js';

export const aggregatorTemplate = (
  naming: NamingVariants,
  services: string[],
  cacheTTL?: number,
  client?: string
): string => {
  const serviceImports = services.map(s => {
    const sNaming = toServiceNaming(s);
    return `import { ${sNaming.pascal}Adapter } from '../adapters/${sNaming.kebab}.adapter';`;
  }).join('\n');

  const serviceParams = services.map(s => {
    const sNaming = toServiceNaming(s);
    return `private readonly ${sNaming.camel}Adapter: ${sNaming.pascal}Adapter`;
  }).join(',\n    ');

  const cacheImport = cacheTTL ? `import { CacheService } from '../cache/cache.interface';\n` : '';
  const cacheParam = cacheTTL ? `,\n    private readonly cache: CacheService` : '';

  return `import { BaseAggregator } from './base.aggregator';
${serviceImports}
${cacheImport}
// Input for the aggregator
interface ${naming.pascal}Input {
  userId: string;
  // TODO: Add more input fields as needed
}

// Output from the aggregator
interface ${naming.pascal}Output {
  // TODO: Define output structure
  data: unknown;
}

/**
 * ${naming.pascal} Aggregator
 *
 * Aggregates data from: ${services.length > 0 ? services.join(', ') : 'TODO: define services'}
 * ${client ? `Optimized for: ${client}` : ''}
 * ${cacheTTL ? `Cache TTL: ${cacheTTL} seconds` : ''}
 */
export class ${naming.pascal}Aggregator extends BaseAggregator<${naming.pascal}Input, ${naming.pascal}Output> {
  constructor(
    ${serviceParams}${cacheParam}
  ) {
    super({ timeout: 5000 });
  }

  async aggregate(input: ${naming.pascal}Input): Promise<${naming.pascal}Output> {
    ${cacheTTL ? `const cacheKey = \`${naming.kebab}:\${input.userId}\`;

    // Try cache first
    const cached = await this.cache.get<${naming.pascal}Output>(cacheKey);
    if (cached) {
      return cached;
    }

    ` : ''}// TODO: Implement aggregation logic
    // Example:
    // const [data1, data2] = await this.parallel([
    //   this.service1Adapter.getData(input.userId),
    //   this.service2Adapter.getData(input.userId)
    // ]);

    const result: ${naming.pascal}Output = {
      data: {}
    };
    ${cacheTTL ? `
    // Store in cache
    await this.cache.set(cacheKey, result, { ttl: ${cacheTTL} });
    ` : ''}
    return result;
  }
}
`;
};

export const aggregatorTestTemplate = (naming: NamingVariants): string => {
  return `import { ${naming.pascal}Aggregator } from '../${naming.kebab}.aggregator';

describe('${naming.pascal}Aggregator', () => {
  let aggregator: ${naming.pascal}Aggregator;

  beforeEach(() => {
    // TODO: Setup mocks
    aggregator = new ${naming.pascal}Aggregator(
      // TODO: Inject mocked adapters
    );
  });

  describe('aggregate', () => {
    it('should aggregate data successfully', async () => {
      const input = { userId: 'test-123' };

      const result = await aggregator.aggregate(input);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle service failures gracefully', async () => {
      // TODO: Mock service failure
      const input = { userId: 'test-123' };

      // Depending on implementation, either:
      // - Should throw an error
      // - Should return partial data with fallback
      await expect(aggregator.aggregate(input)).resolves.toBeDefined();
    });
  });
});
`;
};

const toServiceNaming = (service: string): { pascal: string; camel: string; kebab: string } => {
  const words = service
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return {
    pascal: words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
    camel: words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(''),
    kebab: words.join('-')
  };
};
