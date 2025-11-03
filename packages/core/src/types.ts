import type { CharmGlobalScope } from './utilities/index.js';

declare global {
  interface Window {
    CharmComponents: {
      suffixes?: string[];
      scope?: CharmGlobalScope;
    };
  }
}
