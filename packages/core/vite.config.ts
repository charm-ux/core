import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, UserConfigExport } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const kitchenSinkConfig: UserConfigExport = defineConfig({
  build: {
    outDir: path.join(__dirname, './public'),
    lib: {
      entry: path.join(__dirname, './src/kitchen-sink.ts'),
      formats: ['es'],
      fileName: 'index',
    },
  },
});

// Export based on BUILD_TARGET
export default kitchenSinkConfig;
