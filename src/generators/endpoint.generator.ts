import { toNamingVariants, NamingVariants } from '../utils/naming.js';
import { writeFile, resolvePath, fileExists } from '../utils/files.js';
import { logger } from '../utils/logger.js';
import { endpointTemplate } from '../templates/endpoint.templates.js';

export interface EndpointGeneratorOptions {
  path: string;
  aggregator?: string;
  orchestrator?: string;
  method: string;
  requiresAuth?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

export class EndpointGenerator {
  async generate(options: EndpointGeneratorOptions): Promise<void> {
    const { path, aggregator, orchestrator, method, requiresAuth, dryRun, force } = options;

    const endpointName = path.split('/').filter(Boolean).pop() || 'endpoint';
    const naming = toNamingVariants(endpointName);

    logger.title(`Generating endpoint: ${path}`);

    const files = [
      {
        path: `src/routes/${naming.kebab}.routes.ts`,
        content: endpointTemplate(naming, path, aggregator, orchestrator, method, requiresAuth)
      }
    ];

    if (dryRun) {
      logger.info('Dry run mode - no files will be created');
      logger.newLine();

      files.forEach(file => {
        logger.dryRun(`Would create: ${file.path}`);
      });

      logger.newLine();
      logger.info('Preview of endpoint file:');
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
    logger.success(`Endpoint ${path} created successfully!`);
    logger.newLine();

    logger.box('Configuration', [
      `Path: ${path}`,
      `Method: ${method}`,
      `Auth: ${requiresAuth ? 'required' : 'public'}`,
      aggregator ? `Aggregator: ${aggregator}` : '',
      orchestrator ? `Orchestrator: ${orchestrator}` : ''
    ].filter(Boolean));

    logger.box('Next Steps', [
      `1. Import routes in app.ts`,
      `2. Test: curl -X ${method} http://localhost:3000${path}`
    ]);
  }
}
