import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: path.join(__dirname, 'public/charm'),
    lib: {
      entry: path.join(__dirname, '../core/src/kitchen-sink.ts'),
      name: 'Charm',
      formats: ['es'],
      fileName: 'kitchen-sink',
    },
  },
});
