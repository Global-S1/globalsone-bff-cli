import { NamingVariants } from '../utils/naming.js';

export const transformerTemplate = (
  naming: NamingVariants,
  client?: string,
  fields: string[] = []
): string => {
  const clientMethods = client ? `
  /**
   * Transform for ${client} client
   */
  to${client.charAt(0).toUpperCase() + client.slice(1)}(input: ${naming.pascal}): ${client.charAt(0).toUpperCase() + client.slice(1)}${naming.pascal} {
    return {
      ${fields.length > 0 ? fields.map(f => `${f}: input.${f}`).join(',\n      ') : '// TODO: Map fields for ' + client}
    };
  }` : '';

  const clientInterface = client ? `
// Output for ${client} client
interface ${client.charAt(0).toUpperCase() + client.slice(1)}${naming.pascal} {
  ${fields.length > 0 ? fields.map(f => `${f}: unknown;`).join('\n  ') : '// TODO: Define fields'}
}` : '';

  return `// Input type (from adapter/service)
interface ${naming.pascal} {
  id: string;
  // TODO: Define input fields
}

// Output types
interface ${naming.pascal}Summary {
  id: string;
  // TODO: Define summary fields (minimal data)
}

interface ${naming.pascal}Card {
  id: string;
  // TODO: Define card fields (for list display)
}

interface ${naming.pascal}Detail {
  id: string;
  // TODO: Define detail fields (full data)
}
${clientInterface}

/**
 * ${naming.pascal} Transformer
 *
 * Transforms ${naming.pascal} data for different use cases and clients.
 * ${client ? `Optimized for: ${client}` : ''}
 */
export class ${naming.pascal}Transformer {
  /**
   * Transform to summary (minimal data)
   */
  toSummary(input: ${naming.pascal}): ${naming.pascal}Summary {
    return {
      id: input.id
      // TODO: Include only essential fields
    };
  }

  /**
   * Transform to card (for list display)
   */
  toCard(input: ${naming.pascal}): ${naming.pascal}Card {
    return {
      id: input.id
      // TODO: Include fields needed for list items
    };
  }

  /**
   * Transform to detail (full data)
   */
  toDetail(input: ${naming.pascal}): ${naming.pascal}Detail {
    return {
      id: input.id
      // TODO: Include all fields
    };
  }
${clientMethods}

  /**
   * Transform array to summaries
   */
  toSummaries(inputs: ${naming.pascal}[]): ${naming.pascal}Summary[] {
    return inputs.map(input => this.toSummary(input));
  }

  /**
   * Transform array to cards
   */
  toCards(inputs: ${naming.pascal}[]): ${naming.pascal}Card[] {
    return inputs.map(input => this.toCard(input));
  }
}
`;
};
