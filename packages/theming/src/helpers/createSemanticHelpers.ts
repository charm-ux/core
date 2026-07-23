import { cssVarWithOptions, type CssVarOptions, toKebabCase } from './cssVar.js';

export type AccessorHelpers = {
  get: (...path: [string, ...string[]]) => string;
};

export function createAccessor(label: string, options: CssVarOptions = {}): AccessorHelpers {
  return {
    get: (...path: [string, ...string[]]) => {
      if (path.length === 0) {
        throw new Error(`${label}.get() requires at least one path segment`);
      }
      const kebabPath = path.map(segment => toKebabCase(segment));
      return cssVarWithOptions(kebabPath, options);
    },
  };
}

export type SemanticHelpers = AccessorHelpers;

export function createSemanticHelpers(options: CssVarOptions = {}): SemanticHelpers {
  return createAccessor('semantic', options);
}
