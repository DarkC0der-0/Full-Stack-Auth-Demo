import { mkdir, rm, cp } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const distDir = resolve(root, 'dist');
const targetDir = resolve(root, 'backend', 'public');

async function copyDist() {
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await cp(distDir, targetDir, { recursive: true });
  console.log(`Copied frontend dist -> ${targetDir}`);
}

copyDist().catch((err) => {
  console.error('Failed to copy frontend build:', err);
  process.exit(1);
});
