import { NamingVariants } from '../utils/naming.js';

export const adapterTemplate = (
  naming: NamingVariants,
  baseUrl?: string,
  methods: string[] = [],
  timeout: number = 5000,
  withRetry?: boolean,
  withCircuitBreaker?: boolean
): string => {
  const envVar = `${naming.constant}_URL`;
  const url = baseUrl || `process.env.${envVar} || 'http://localhost:3001'`;

  const circuitBreakerImport = withCircuitBreaker
    ? `import { CircuitBreaker } from '../resilience/circuit-breaker';\n`
    : '';

  const circuitBreakerSetup = withCircuitBreaker ? `
  private readonly circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000
  });` : '';

  const defaultMethods = methods.length === 0;
  const methodsToGenerate = defaultMethods
    ? ['getById', 'getAll', 'create', 'update', 'delete']
    : methods;

  const methodsCode = methodsToGenerate.map(method => {
    switch (method.toLowerCase()) {
      case 'getbyid':
        return `
  async getById(id: string): Promise<${naming.pascal}> {
    const dto = await this.get<${naming.pascal}DTO>(\`/${naming.kebab}s/\${id}\`);
    return this.mapTo${naming.pascal}(dto);
  }`;
      case 'getall':
        return `
  async getAll(params?: { page?: number; limit?: number }): Promise<${naming.pascal}[]> {
    const dtos = await this.get<${naming.pascal}DTO[]>('/${naming.kebab}s', params);
    return dtos.map(dto => this.mapTo${naming.pascal}(dto));
  }`;
      case 'create':
        return `
  async create(data: Create${naming.pascal}Input): Promise<${naming.pascal}> {
    const dto = await this.post<${naming.pascal}DTO>('/${naming.kebab}s', this.mapToDTO(data));
    return this.mapTo${naming.pascal}(dto);
  }`;
      case 'update':
        return `
  async update(id: string, data: Update${naming.pascal}Input): Promise<${naming.pascal}> {
    const dto = await this.put<${naming.pascal}DTO>(\`/${naming.kebab}s/\${id}\`, this.mapToDTO(data));
    return this.mapTo${naming.pascal}(dto);
  }`;
      case 'delete':
        return `
  async remove(id: string): Promise<void> {
    await this.delete(\`/${naming.kebab}s/\${id}\`);
  }`;
      default:
        return `
  async ${method}(): Promise<unknown> {
    // TODO: Implement ${method}
    return this.get('/${naming.kebab}s/${method}');
  }`;
    }
  }).join('\n');

  return `import { BaseAdapter } from './base.adapter';
${circuitBreakerImport}
// DTO from external service
interface ${naming.pascal}DTO {
  id: string;
  // TODO: Define DTO fields based on external service response
}

// Domain model for BFF
export interface ${naming.pascal} {
  id: string;
  // TODO: Define domain model fields
}

// Input types
export interface Create${naming.pascal}Input {
  // TODO: Define create input fields
}

export interface Update${naming.pascal}Input {
  // TODO: Define update input fields
}

/**
 * ${naming.pascal} Adapter
 *
 * Communicates with: ${baseUrl || envVar}
 * Timeout: ${timeout}ms
 * ${withRetry ? 'Retry: enabled' : ''}
 * ${withCircuitBreaker ? 'Circuit Breaker: enabled' : ''}
 */
export class ${naming.pascal}Adapter extends BaseAdapter {${circuitBreakerSetup}

  constructor() {
    super('${naming.kebab}', {
      baseUrl: ${url},
      timeout: ${timeout},
      retries: ${withRetry ? 3 : 0}
    });
  }
${methodsCode}

  // Mappers
  private mapTo${naming.pascal}(dto: ${naming.pascal}DTO): ${naming.pascal} {
    return {
      id: dto.id
      // TODO: Map other fields
    };
  }

  private mapToDTO(input: Create${naming.pascal}Input | Update${naming.pascal}Input): Partial<${naming.pascal}DTO> {
    return {
      // TODO: Map input to DTO
    };
  }
}
`;
};

export const adapterTestTemplate = (naming: NamingVariants): string => {
  return `import { ${naming.pascal}Adapter } from '../${naming.kebab}.adapter';

describe('${naming.pascal}Adapter', () => {
  let adapter: ${naming.pascal}Adapter;

  beforeEach(() => {
    adapter = new ${naming.pascal}Adapter();
    // TODO: Mock HTTP client
  });

  describe('getById', () => {
    it('should return mapped entity', async () => {
      // TODO: Mock HTTP response

      const result = await adapter.getById('123');

      expect(result.id).toBe('123');
    });

    it('should throw NotFoundError for 404', async () => {
      // TODO: Mock 404 response

      await expect(adapter.getById('999')).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('should return array of mapped entities', async () => {
      // TODO: Mock HTTP response

      const results = await adapter.getAll();

      expect(Array.isArray(results)).toBe(true);
    });
  });
});
`;
};
