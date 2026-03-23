import { toNamingVariants, NamingVariants } from '../utils/naming.js';
import { writeFile, resolvePath, fileExists } from '../utils/files.js';
import { logger } from '../utils/logger.js';
import { adapterTemplate, adapterTestTemplate } from '../templates/adapter.templates.js';

export interface AdapterGeneratorOptions {
  name: string;
  baseUrl?: string;
  methods: string[];
  timeout: number;
  withRetry?: boolean;
  withCircuitBreaker?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

export class AdapterGenerator {
  async generate(options: AdapterGeneratorOptions): Promise<void> {
    const { name, baseUrl, methods, timeout, withRetry, withCircuitBreaker, dryRun, force } = options;
    const naming = toNamingVariants(name);

    logger.title(`Generating adapter: ${naming.kebab}`);

    const files = [
      {
        path: `src/adapters/${naming.kebab}.adapter.ts`,
        content: adapterTemplate(naming, baseUrl, methods, timeout, withRetry, withCircuitBreaker)
      },
      {
        path: `src/adapters/__tests__/${naming.kebab}.adapter.test.ts`,
        content: adapterTestTemplate(naming)
      }
    ];

    if (dryRun) {
      logger.info('Dry run mode - no files will be created');
      logger.newLine();

      files.forEach(file => {
        logger.dryRun(`Would create: ${file.path}`);
      });

      logger.newLine();
      logger.info('Preview of adapter file:');
      logger.newLine();
      console.log(files[0].content);
      return;
    }

    for (const file of files) {
      const fullPath = resolvePath(file.path);
      const exists = await fileExists(fullPath);

      if (exists && !force) {
        logger.fileSkipped(file.path);
        continue;
      }

      await writeFile(fullPath, file.content, { force });
      logger.fileCreated(file.path);
    }

    logger.newLine();
    logger.success(`Adapter ${naming.kebab} created successfully!`);
    logger.newLine();

    const features = [];
    if (withRetry) features.push('retry');
    if (withCircuitBreaker) features.push('circuit-breaker');

    logger.box('Configuration', [
      `Base URL: ${baseUrl || '(configure in .env)'}`,
      `Timeout: ${timeout}ms`,
      `Methods: ${methods.length > 0 ? methods.join(', ') : 'getById, getAll, create, update, delete'}`,
      `Features: ${features.length > 0 ? features.join(', ') : 'basic'}`
    ]);

    logger.box('Next Steps', [
      `1. Configure ${naming.constant}_URL in .env`,
      `2. Define DTO and Model types`,
      `3. Implement mapping logic`,
      `4. Run tests: npm test`
    ]);
  }
}
