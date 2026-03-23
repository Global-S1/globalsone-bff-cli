import chalk from 'chalk';
import ora, { Ora } from 'ora';

class Logger {
  private spinner: Ora | null = null;

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✔'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.log(chalk.red('✖'), message);
  }

  log(message: string): void {
    console.log(message);
  }

  newLine(): void {
    console.log('');
  }

  title(message: string): void {
    console.log('');
    console.log(chalk.bold.cyan(message));
    console.log(chalk.cyan('─'.repeat(message.length)));
  }

  fileCreated(filePath: string): void {
    console.log(chalk.green('  CREATE'), chalk.gray(filePath));
  }

  fileUpdated(filePath: string): void {
    console.log(chalk.yellow('  UPDATE'), chalk.gray(filePath));
  }

  fileSkipped(filePath: string): void {
    console.log(chalk.gray('  SKIP'), chalk.gray(filePath));
  }

  dryRun(message: string): void {
    console.log(chalk.magenta('  [DRY-RUN]'), message);
  }

  box(title: string, content: string[]): void {
    const maxLength = Math.max(title.length, ...content.map(c => c.length));
    const border = '─'.repeat(maxLength + 2);

    console.log('');
    console.log(chalk.cyan(`┌${border}┐`));
    console.log(chalk.cyan('│'), chalk.bold(title.padEnd(maxLength)), chalk.cyan('│'));
    console.log(chalk.cyan(`├${border}┤`));

    content.forEach(line => {
      console.log(chalk.cyan('│'), line.padEnd(maxLength), chalk.cyan('│'));
    });

    console.log(chalk.cyan(`└${border}┘`));
    console.log('');
  }
}

export const logger = new Logger();
