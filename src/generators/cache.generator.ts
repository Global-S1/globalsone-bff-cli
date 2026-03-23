import { toNamingVariants, NamingVariants } from '../utils/naming.js';
import { writeFile, resolvePath, fileExists } from '../utils/files.js';
import { logger } from '../utils/logger.js';
import { cacheTemplate } from '../templates/cache.templates.js';

export interface CacheGeneratorOptions {
  name: string;
  strategy: 'cache-aside' | 'write-through' | 'stale-while-revalidate';
  ttl: number;
  tags: string[];
  dryRun?: boolean;
  force?: boolean;
}

export class CacheGenerator {
  async generate(options: CacheGeneratorOptions): Promise<void> {
    const { name, strategy, ttl, tags, dryRun, force } = options;
    const naming = toNamingVariants(name);

    logger.title(`Generating cache: ${naming.kebab}`);

    const files = [
      {
        path: `src/cache/${naming.kebab}.cache.ts`,
        content: cacheTemplate(naming, strategy, ttl, tags)
      }
    ];

    if (dryRun) {
      logger.info('Dry run mode - no files will be created');
      logger.newLine();

      files.forEach(file => {
        logger.dryRun(`Would create: ${file.path}`);
      });

      logger.newLine();
      logger.info('Preview of cache file:');
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
    logger.success(`Cache ${naming.kebab} created successfully!`);
    logger.newLine();

    logger.box('Configuration', [
      `Strategy: ${strategy}`,
      `Default TTL: ${ttl} seconds`,
      `Tags: ${tags.length > 0 ? tags.join(', ') : '(none)'}`
    ]);
  }
}
