import { cssVarName } from '../../helpers/cssVar.js';
import type {
  ComponentFactoryHelpers,
  ComponentRefFn,
  PrimitiveRefFn,
  PrimitiveTokens,
  SemanticFactoryHelpers,
  SemanticRefFn,
} from '../../types/tokens.js';

type MetadataFields = {
  description?: string;
  deprecated?: string | boolean;
};

type MetadataWrapper = MetadataFields & {
  value: unknown;
};
export type TokenTreeLeaf = {
  path: string[];
  value: unknown;
  description?: string;
  deprecated?: string | boolean;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasLightDarkShape(value: unknown): value is { light: unknown; dark: unknown } {
  return isObject(value) && 'light' in value && 'dark' in value;
}

export function isMetadataWrapped(value: unknown): value is MetadataWrapper {
  return isObject(value) && 'value' in value && !hasLightDarkShape(value);
}

export function unwrapTokenMetadata(node: unknown): {
  value: unknown;
  description?: string;
  deprecated?: string | boolean;
} {
  if (isMetadataWrapped(node)) {
    return {
      value: node.value,
      description: node.description,
      deprecated: node.deprecated,
    };
  }
  return { value: node };
}

export function unwrapTokenValue(node: unknown): unknown {
  return isMetadataWrapped(node) ? node.value : node;
}

type CollectTokenTreeLeavesOptions = {
  path?: string[];
  mapKey?: (key: string) => string;
  isLeafValue?: (value: unknown) => boolean;
};

/**
 * Collect every terminal leaf in a semantic/component token tree.
 *
 * Leaves include primitive values, arrays, and light/dark objects. Plain
 * objects are treated as nested groups and recursed into after metadata
 * unwrapping.
 */
export function collectTokenTreeLeaves(node: unknown, options: CollectTokenTreeLeavesOptions = {}): TokenTreeLeaf[] {
  const mapKey = options.mapKey ?? (key => key);
  const isLeafValue = options.isLeafValue;

  function walk(current: unknown, path: string[]): TokenTreeLeaf[] {
    if (current === undefined || current === null) return [];

    const { value, description, deprecated } = unwrapTokenMetadata(current);

    if (value === undefined) return [];
    if (
      hasLightDarkShape(value) ||
      typeof value !== 'object' ||
      value === null ||
      Array.isArray(value) ||
      (isLeafValue ? isLeafValue(value) : false)
    ) {
      return [{ path, value, description, deprecated }];
    }

    return Object.entries(value).flatMap(([key, child]) => walk(child, [...path, mapKey(key)]));
  }

  return walk(node, options.path ?? []);
}

/**
 * Create layer-specific reference functions for factories.
 * All functions generate the same CSS var() output, but are typed differently
 * to support the layer-specific helper signatures.
 */
function createFactoryHelpers<P extends PrimitiveTokens>(
  prefix: string
): {
  semantic: SemanticFactoryHelpers<P>;
  component: ComponentFactoryHelpers<P>;
} {
  const makeRef = ((...segments: (string | number)[]) =>
    `var(${cssVarName(prefix, ...segments)})`) as PrimitiveRefFn<P> & SemanticRefFn & ComponentRefFn;

  return {
    semantic: { primitive: makeRef },
    component: { primitive: makeRef, semantic: makeRef },
  };
}

export function resolveMaybeSemanticFactory<P extends PrimitiveTokens, T extends Record<string, unknown>>(
  input: T | ((helpers: SemanticFactoryHelpers<P>) => T) | undefined,
  prefix: string
): T | undefined {
  if (input === undefined) return undefined;
  if (typeof input === 'function') {
    const helpers = createFactoryHelpers<P>(prefix);
    return (input as (helpers: SemanticFactoryHelpers<P>) => T)(helpers.semantic);
  }
  return input;
}

export function resolveMaybeComponentFactory<P extends PrimitiveTokens, T extends Record<string, unknown>>(
  input: T | ((helpers: ComponentFactoryHelpers<P>) => T) | undefined,
  prefix: string
): T | undefined {
  if (input === undefined) return undefined;
  if (typeof input === 'function') {
    const helpers = createFactoryHelpers<P>(prefix);
    return (input as (helpers: ComponentFactoryHelpers<P>) => T)(helpers.component);
  }
  return input;
}
