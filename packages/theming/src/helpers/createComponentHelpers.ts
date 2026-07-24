import { type CssVarOptions } from './cssVar.js';
import { type AccessorHelpers, createAccessor } from './createSemanticHelpers.js';

export type ComponentHelpers = AccessorHelpers;

export function createComponentHelpers(options: CssVarOptions = {}): ComponentHelpers {
  return createAccessor('component', options);
}
