import { NamingVariants } from '../utils/naming.js';

export const orchestratorTemplate = (
  naming: NamingVariants,
  steps: string[],
  withRollback?: boolean,
  withRetry?: boolean,
  maxRetries?: number
): string => {
  const stepsCode = steps.length > 0
    ? steps.map((step, index) => {
        const stepNaming = toStepNaming(step);
        const rollbackCode = withRollback && index > 0
          ? `,\n        () => this.rollback${stepNaming.pascal}(context)`
          : '';
        return `
      // Step ${index + 1}: ${stepNaming.pascal}
      const ${stepNaming.camel}Result = await this.executeStep(
        context,
        '${stepNaming.kebab}',
        () => this.${stepNaming.camel}(context)${rollbackCode}
      );
      context.set('${stepNaming.camel}Result', ${stepNaming.camel}Result);`;
      }).join('\n')
    : `
      // TODO: Add your steps here
      // Example:
      // const result = await this.executeStep(
      //   context,
      //   'step-name',
      //   () => this.stepAction(context),
      //   () => this.rollbackStep(context) // Optional rollback
      // );`;

  const stepMethods = steps.length > 0
    ? steps.map(step => {
        const stepNaming = toStepNaming(step);
        return `
  private async ${stepNaming.camel}(context: OrchestrationContext<${naming.pascal}Input>): Promise<unknown> {
    // TODO: Implement ${stepNaming.camel} logic
    return {};
  }${withRollback ? `

  private async rollback${stepNaming.pascal}(context: OrchestrationContext<${naming.pascal}Input>): Promise<void> {
    // TODO: Implement rollback logic for ${stepNaming.camel}
  }` : ''}`;
      }).join('\n')
    : '';

  const retryImport = withRetry ? `import { withRetry } from '../resilience/retry';\n` : '';
  const retryOptions = withRetry ? `
  private readonly retryOptions = {
    maxRetries: ${maxRetries || 3},
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  };` : '';

  return `import { BaseOrchestrator } from './base.orchestrator';
import { OrchestrationContext } from './context';
${retryImport}
// Input for the orchestrator
interface ${naming.pascal}Input {
  userId: string;
  // TODO: Add more input fields
}

// Output from the orchestrator
interface ${naming.pascal}Output {
  success: boolean;
  // TODO: Define output structure
}

/**
 * ${naming.pascal} Orchestrator
 *
 * Orchestrates: ${steps.length > 0 ? steps.join(' → ') : 'TODO: define steps'}
 * ${withRollback ? 'Features: rollback support' : ''}
 * ${withRetry ? `Features: retry with ${maxRetries} max retries` : ''}
 */
export class ${naming.pascal}Orchestrator extends BaseOrchestrator<${naming.pascal}Input, ${naming.pascal}Output> {${retryOptions}

  constructor(
    // TODO: Inject adapters
  ) {
    super({ timeout: 30000 });
  }

  async execute(input: ${naming.pascal}Input): Promise<${naming.pascal}Output> {
    const context = new OrchestrationContext(input);

    try {${stepsCode}

      return {
        success: true
        // TODO: Return result data
      };

    } catch (error) {
      ${withRollback ? `// Execute rollbacks in reverse order
      await context.executeRollbacks();
      ` : ''}
      throw error;
    }
  }
${stepMethods}
}
`;
};

export const orchestratorTestTemplate = (naming: NamingVariants, steps: string[]): string => {
  return `import { ${naming.pascal}Orchestrator } from '../${naming.kebab}.orchestrator';

describe('${naming.pascal}Orchestrator', () => {
  let orchestrator: ${naming.pascal}Orchestrator;

  beforeEach(() => {
    // TODO: Setup mocks
    orchestrator = new ${naming.pascal}Orchestrator(
      // TODO: Inject mocked adapters
    );
  });

  describe('execute', () => {
    it('should complete all steps successfully', async () => {
      const input = { userId: 'test-123' };

      const result = await orchestrator.execute(input);

      expect(result.success).toBe(true);
    });

    it('should rollback on failure', async () => {
      // TODO: Mock step failure
      const input = { userId: 'test-123' };

      await expect(orchestrator.execute(input)).rejects.toThrow();

      // TODO: Verify rollback was called
    });
  });
});
`;
};

const toStepNaming = (step: string): { pascal: string; camel: string; kebab: string } => {
  const words = step
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
