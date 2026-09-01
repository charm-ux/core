// src/index.ts
//
// Legacy root barrel - kept for `main`/`types` compatibility. All runtime-safe
// exports live in `./runtime.js`; generator functions are imported from the
// `@charm-ux/theming/generator` subpath (see `./generator/index.js`).
export * from './runtime.js';
