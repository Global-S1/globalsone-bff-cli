declare module 'commander' {
  export class Command {
    constructor(name?: string);
    alias(alias: string): this;
    name(name: string): this;
    description(description: string): this;
    version(version: string): this;
    command(name: string): this;
    option(flag: string, description: string, defaultValue?: any): this;
    option(flag: string, description: string, config?: any): this;
    action(fn: (...args: any[]) => unknown): this;
    addCommand(cmd: Command): this;
    parse(argv?: string[]): this;
  }
}

declare module 'chalk' {
  const chalk: any;
  export default chalk;
}

declare module 'ora' {
  interface OraInstance {
    start(): OraInstance;
    stop(): OraInstance;
    succeed(text?: string): OraInstance;
    fail(text?: string): OraInstance;
    info(text?: string): OraInstance;
    text: string;
  }

  function ora(text?: string): OraInstance;
  namespace ora {
    export type Ora = OraInstance;
  }

  export default ora;
  export type Ora = OraInstance;
}

declare module 'inquirer';
declare module 'fs/promises';
declare module 'path';

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  interface ErrnoException extends Error {
    code?: string;
    errno?: number;
    syscall?: string;
    path?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
  argv: string[];
  exit(code?: number): never;
  cwd(): string;
};

declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
  trace(...args: any[]): void;
};
