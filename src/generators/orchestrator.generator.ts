import { toNamingVariants, NamingVariants } from '../utils/naming.js';
import { writeFile, resolvePath, fileExists } from '../utils/files.js';
import { logger } from '../utils/logger.js';
import { orchestratorTemplate, orchestratorTestTemplate } from '../templates/orchestrator.templates.js';

export interface OrchestratorGeneratorOptions {
  name: string;
  steps: string[];
  withRollback?: boolean;
  withRetry?: boolean;
  maxRetries?: number;
  dryRun?: boolean;
  force?: boolean;
}

export class OrchestratorGenerator {
  async generate(options: OrchestratorGeneratorOptions): Promise<void> {
    const { name, steps, withRollback, withRetry, maxRetries, dryRun, force } = options;
    const naming = toNamingVariants(name);

    logger.title(`Generating orchestrator: ${naming.kebab}`);

    const files = [
      {
        path: `src/orchestrators/${naming.kebab}.orchestrator.ts`,
        content: orchestratorTemplate(naming, steps, withRollback, withRetry, maxRetries)
      },
      {
        path: `src/orchestrators/__tests__/${naming.kebab}.orchestrator.test.ts`,
        content: orchestratorTestTemplate(naming, steps)
      }
    ];

    if (dryRun) {
      logger.info('Dry run mode - no files will be created');
      logger.newLine();

      files.forEach(file => {
        logger.dryRun(`Would create: ${file.path}`);
      });

      logger.newLine();
      logger.info('Preview of orchestrator file:');
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
    logger.success(`Orchestrator ${naming.kebab} created successfully!`);
    logger.newLine();

    const features = [];
    if (withRollback) features.push('rollback');
    if (withRetry) features.push('retry');

    logger.box('Configuration', [
      `Steps: ${steps.length > 0 ? steps.join(' → ') : '(define steps)'}`,
      `Features: ${features.length > 0 ? features.join(', ') : 'basic'}`,
      withRetry ? `Max Retries: ${maxRetries}` : ''
    ].filter(Boolean));

    logger.box('Next Steps', [
      `1. Implement step logic in ${naming.kebab}.orchestrator.ts`,
      `2. Create adapters for each step`,
      `3. Create endpoint: bff g e /api/${naming.kebab} -o ${naming.camel} -m POST`,
      `4. Run tests: npm test`
    ]);
  }
}
