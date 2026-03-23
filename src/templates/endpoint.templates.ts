import { NamingVariants } from '../utils/naming.js';

export const endpointTemplate = (
  naming: NamingVariants,
  path: string,
  aggregator?: string,
  orchestrator?: string,
  method: string = 'GET',
  requiresAuth?: boolean
): string => {
  const aggregatorImport = aggregator
    ? `import { ${toPascal(aggregator)}Aggregator } from '../aggregators/${toKebab(aggregator)}.aggregator';\n`
    : '';

  const orchestratorImport = orchestrator
    ? `import { ${toPascal(orchestrator)}Orchestrator } from '../orchestrators/${toKebab(orchestrator)}.orchestrator';\n`
    : '';

  const authImport = requiresAuth
    ? `import { authMiddleware } from '../middlewares/auth.middleware';\n`
    : '';

  const authMiddleware = requiresAuth ? 'authMiddleware(), ' : '';

  const handlerType = aggregator ? 'aggregator' : orchestrator ? 'orchestrator' : 'custom';

  let handlerCode: string;
  if (aggregator) {
    handlerCode = `
// Initialize aggregator
const ${toCamel(aggregator)}Aggregator = new ${toPascal(aggregator)}Aggregator(
  // TODO: Inject adapters
);

router.${method.toLowerCase()}('${path}', ${authMiddleware}async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = {
      userId: ${requiresAuth ? '(req as any).user.id' : "req.query.userId as string || 'anonymous'"}
      // TODO: Add more input from request
    };

    const result = await ${toCamel(aggregator)}Aggregator.aggregate(input);

    res.json(result);
  } catch (error) {
    next(error);
  }
});`;
  } else if (orchestrator) {
    handlerCode = `
// Initialize orchestrator
const ${toCamel(orchestrator)}Orchestrator = new ${toPascal(orchestrator)}Orchestrator(
  // TODO: Inject adapters
);

router.${method.toLowerCase()}('${path}', ${authMiddleware}async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = {
      userId: ${requiresAuth ? '(req as any).user.id' : "req.body.userId"},
      ...req.body
    };

    const result = await ${toCamel(orchestrator)}Orchestrator.execute(input);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});`;
  } else {
    handlerCode = `
router.${method.toLowerCase()}('${path}', ${authMiddleware}async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement handler logic

    res.json({ message: 'Success' });
  } catch (error) {
    next(error);
  }
});`;
  }

  return `import { Router, Request, Response, NextFunction } from 'express';
${aggregatorImport}${orchestratorImport}${authImport}
const router = Router();

/**
 * ${method} ${path}
 *
 * ${aggregator ? `Uses: ${aggregator} aggregator` : ''}
 * ${orchestrator ? `Uses: ${orchestrator} orchestrator` : ''}
 * ${requiresAuth ? 'Requires: authentication' : 'Public endpoint'}
 */
${handlerCode}

export { router as ${naming.camel}Routes };
`;
};

const toPascal = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
};

const toCamel = (str: string): string => {
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase()
    .split(/\s+/);
  return words
    .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
};

const toKebab = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .join('-');
};
