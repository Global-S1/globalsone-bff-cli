import { toNamingVariants, NamingVariants } from '../utils/naming.js';
import { writeFile, resolvePath, fileExists } from '../utils/files.js';
import { logger } from '../utils/logger.js';
import { aggregatorTemplate, aggregatorTestTemplate } from '../templates/aggregator.templates.js';

export interface AggregatorGeneratorOptions {
  name: string;
  services: string[];
  cacheTTL?: number;
  client?: 'web' | 'mobile' | 'tv';
  dryRun?: boolean;
  force?: boolean;
}

export class AggregatorGenerator {
  async generate(options: AggregatorGeneratorOptions): Promise<void> {
    const { name, services, cacheTTL, client, dryRun, force } = options;
    const naming = toNamingVariants(name);

    logger.title(`Generating aggregator: ${naming.kebab}`);

    const files = [
      {
        path: `src/aggregators/${naming.kebab}.aggregator.ts`,
        content: aggregatorTemplate(naming, services, cacheTTL, client)
      },
      {
        path: `src/aggregators/__tests__/${naming.kebab}.aggregator.test.ts`,
        content: aggregatorTestTemplate(naming)
      }
    ];

    if (dryRun) {
      logger.info('Dry run mode - no files will be created');
      logger.newLine();

      files.forEach(file => {
        logger.dryRun(`Would create: ${file.path}`);
      });

      logger.newLine();
      logger.info('Preview of aggregator file:');
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
    logger.success(`Aggregator ${naming.kebab} created successfully!`);
    logger.newLine();

    logger.box('Next Steps', [
      `1. Implement aggregation logic in ${naming.kebab}.aggregator.ts`,
      `2. Create adapters for services: ${services.length > 0 ? services.join(', ') : '(define services)'}`,
      `3. Create endpoint: bff g e /api/${naming.kebab} -a ${naming.camel}`,
      `4. Run tests: npm test`
    ]);
  }
}
