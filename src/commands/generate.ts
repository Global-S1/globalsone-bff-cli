import { Command } from 'commander';
import { AggregatorGenerator } from '../generators/aggregator.generator.js';
import { OrchestratorGenerator } from '../generators/orchestrator.generator.js';
import { AdapterGenerator } from '../generators/adapter.generator.js';
import { TransformerGenerator } from '../generators/transformer.generator.js';
import { CacheGenerator } from '../generators/cache.generator.js';
import { EndpointGenerator } from '../generators/endpoint.generator.js';
import { logger } from '../utils/logger.js';

type CommandOptions = Record<string, any>;

export const generateCommand = new Command('generate')
  .alias('g')
  .description('Genera codigo para el BFF');

// Aggregator command
generateCommand
  .command('aggregator <name>')
  .alias('a')
  .description('Genera un agregador de datos')
  .option('-s, --services <services>', 'Servicios a agregar (separados por coma)')
  .option('-c, --cache <ttl>', 'TTL de cache en segundos')
  .option('--client <type>', 'Tipo de cliente (web, mobile, tv)')
  .option('--dry-run', 'Preview sin crear archivos')
  .option('--force', 'Sobrescribir archivos existentes')
  .action(async (name: string, options: CommandOptions) => {
    try {
      const generator = new AggregatorGenerator();
      await generator.generate({
        name,
        services: options.services ? options.services.split(',').map((s: string) => s.trim()) : [],
        cacheTTL: options.cache ? parseInt(options.cache, 10) : undefined,
        client: options.client,
        dryRun: options.dryRun,
        force: options.force
      });
    } catch (error) {
      logger.error(`Error generando agregador: ${error instanceof Error ? error.message : 'Unknown'}`);
      process.exit(1);
    }
  });

// Orchestrator command
generateCommand
  .command('orchestrator <name>')
  .alias('o')
  .description('Genera un orquestador de flujo')
  .option('--steps <steps>', 'Pasos del flujo (separados por coma)')
  .option('--with-rollback', 'Incluir logica de rollback')
  .option('--with-retry', 'Incluir logica de retry')
  .option('--max-retries <n>', 'Numero maximo de reintentos', '3')
  .option('--dry-run', 'Preview sin crear archivos')
  .option('--force', 'Sobrescribir archivos existentes')
  .action(async (name: string, options: CommandOptions) => {
    try {
      const generator = new OrchestratorGenerator();
      await generator.generate({
        name,
        steps: options.steps ? options.steps.split(',').map((s: string) => s.trim()) : [],
        withRollback: options.withRollback,
        withRetry: options.withRetry,
        maxRetries: parseInt(options.maxRetries, 10),
        dryRun: options.dryRun,
        force: options.force
      });
    } catch (error) {
      logger.error(`Error generando orquestador: ${error instanceof Error ? error.message : 'Unknown'}`);
      process.exit(1);
    }
  });

// Adapter command
generateCommand
  .command('adapter <name>')
  .alias('ad')
  .description('Genera un adaptador de servicio')
  .option('-u, --base-url <url>', 'URL base del servicio')
  .option('-m, --methods <methods>', 'Metodos a generar (separados por coma)')
  .option('--timeout <ms>', 'Timeout en ms', '5000')
  .option('--with-retry', 'Incluir logica de retry')
  .option('--with-circuit-breaker', 'Incluir circuit breaker')
  .option('--dry-run', 'Preview sin crear archivos')
  .option('--force', 'Sobrescribir archivos existentes')
  .action(async (name: string, options: CommandOptions) => {
    try {
      const generator = new AdapterGenerator();
      await generator.generate({
        name,
        baseUrl: options.baseUrl,
        methods: options.methods ? options.methods.split(',').map((m: string) => m.trim()) : [],
        timeout: parseInt(options.timeout, 10),
        withRetry: options.withRetry,
        withCircuitBreaker: options.withCircuitBreaker,
        dryRun: options.dryRun,
        force: options.force
      });
    } catch (error) {
      logger.error(`Error generando adaptador: ${error instanceof Error ? error.message : 'Unknown'}`);
      process.exit(1);
    }
  });

// Transformer command
generateCommand
  .command('transformer <name>')
  .alias('t')
  .description('Genera un transformador de datos')
  .option('--client <type>', 'Tipo de cliente (web, mobile, tv)')
  .option('--fields <fields>', 'Campos a incluir (separados por coma)')
  .option('--dry-run', 'Preview sin crear archivos')
  .option('--force', 'Sobrescribir archivos existentes')
  .action(async (name: string, options: CommandOptions) => {
    try {
      const generator = new TransformerGenerator();
      await generator.generate({
        name,
        client: options.client,
        fields: options.fields ? options.fields.split(',').map((f: string) => f.trim()) : [],
        dryRun: options.dryRun,
        force: options.force
      });
    } catch (error) {
      logger.error(`Error generando transformador: ${error instanceof Error ? error.message : 'Unknown'}`);
      process.exit(1);
    }
  });

// Cache command
generateCommand
  .command('cache <name>')
  .alias('c')
  .description('Genera una estrategia de cache')
  .option('--strategy <strategy>', 'Estrategia de cache (cache-aside, write-through, stale-while-revalidate)', 'cache-aside')
  .option('--ttl <seconds>', 'TTL por defecto', '300')
  .option('--tags <tags>', 'Tags para invalidacion (separados por coma)')
  .option('--dry-run', 'Preview sin crear archivos')
  .option('--force', 'Sobrescribir archivos existentes')
  .action(async (name: string, options: CommandOptions) => {
    try {
      const generator = new CacheGenerator();
      await generator.generate({
        name,
        strategy: options.strategy,
        ttl: parseInt(options.ttl, 10),
        tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [],
        dryRun: options.dryRun,
        force: options.force
      });
    } catch (error) {
      logger.error(`Error generando cache: ${error instanceof Error ? error.message : 'Unknown'}`);
      process.exit(1);
    }
  });

// Endpoint command
generateCommand
  .command('endpoint <path>')
  .alias('e')
  .description('Genera un endpoint BFF')
  .option('-a, --aggregator <name>', 'Agregador a usar')
  .option('-o, --orchestrator <name>', 'Orquestador a usar')
  .option('-m, --method <method>', 'Metodo HTTP', 'GET')
  .option('--auth', 'Requiere autenticacion')
  .option('--dry-run', 'Preview sin crear archivos')
  .option('--force', 'Sobrescribir archivos existentes')
  .action(async (path: string, options: CommandOptions) => {
    try {
      const generator = new EndpointGenerator();
      await generator.generate({
        path,
        aggregator: options.aggregator,
        orchestrator: options.orchestrator,
        method: options.method.toUpperCase(),
        requiresAuth: options.auth,
        dryRun: options.dryRun,
        force: options.force
      });
    } catch (error) {
      logger.error(`Error generando endpoint: ${error instanceof Error ? error.message : 'Unknown'}`);
      process.exit(1);
    }
  });
