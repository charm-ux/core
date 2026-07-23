import { type CssVarOptions } from './cssVar.js';
import { createAccessor, type AccessorHelpers } from './createSemanticHelpers.js';

export type ComponentHelpers = AccessorHelpers;

export function createComponentHelpers(options: CssVarOptions = {}): ComponentHelpers {
  return createAccessor('component', options);
}
