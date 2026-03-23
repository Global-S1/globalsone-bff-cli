import { toNamingVariants, NamingVariants } from '../utils/naming.js';
import { writeFile, resolvePath, fileExists } from '../utils/files.js';
import { logger } from '../utils/logger.js';
import { transformerTemplate } from '../templates/transformer.templates.js';

export interface TransformerGeneratorOptions {
  name: string;
  client?: 'web' | 'mobile' | 'tv';
  fields: string[];
  dryRun?: boolean;
  force?: boolean;
}

export class TransformerGenerator {
  async generate(options: TransformerGeneratorOptions): Promise<void> {
    const { name, client, fields, dryRun, force } = options;
    const naming = toNamingVariants(name);

    logger.title(`Generating transformer: ${naming.kebab}`);

    const files = [
      {
        path: `src/transformers/${naming.kebab}.transformer.ts`,
        content: transformerTemplate(naming, client, fields)
      }
    ];

    if (dryRun) {
      logger.info('Dry run mode - no files will be created');
      logger.newLine();

      files.forEach(file => {
        logger.dryRun(`Would create: ${file.path}`);
      });

      logger.newLine();
      logger.info('Preview of transformer file:');
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
    logger.success(`Transformer ${naming.kebab} created successfully!`);
    logger.newLine();

    logger.box('Next Steps', [
      `1. Define input/output types`,
      `2. Implement transformation logic`,
      `3. Use in aggregators/orchestrators`
    ]);
  }
}
