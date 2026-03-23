#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';

const program = new Command();

program
  .name('bff')
  .description('CLI para generar codigo del Backend for Frontend')
  .version('1.0.0');

program.addCommand(generateCommand);

program.parse();
