import fs from 'fs/promises';
import path from 'path';

export const ensureDir = async (dirPath: string): Promise<void> => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
};

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const writeFile = async (
  filePath: string,
  content: string,
  options: { force?: boolean } = {}
): Promise<void> => {
  const exists = await fileExists(filePath);

  if (exists && !options.force) {
    throw new Error(`File already exists: ${filePath}. Use --force to overwrite.`);
  }

  const dir = path.dirname(filePath);
  await ensureDir(dir);
  await fs.writeFile(filePath, content, 'utf-8');
};

export const getProjectRoot = (): string => {
  return process.cwd();
};

export const resolvePath = (...segments: string[]): string => {
  return path.join(getProjectRoot(), ...segments);
};
