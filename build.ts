import { build } from 'esbuild';
import { promises as fs } from 'fs';

(async () => {
  await fs.mkdir('./dist', { recursive: true });
  build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outdir: './dist',
    platform: 'node',
    format: 'cjs',
  });
})();
