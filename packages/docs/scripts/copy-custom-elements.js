#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.resolve(__dirname, '../../core/custom-elements.json');
const destPath = path.resolve(__dirname, '../custom-elements.json');

try {
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file not found: ${sourcePath}`);
    console.log('Make sure to build the core package first: pnpm --filter @charm-ux/core run build');
    process.exit(1);
  }

  fs.copyFileSync(sourcePath, destPath);
  console.log('✅ Successfully copied custom-elements.json from core to docs');
} catch (error) {
  console.error('❌ Error copying custom-elements.json:', error.message);
  process.exit(1);
}
