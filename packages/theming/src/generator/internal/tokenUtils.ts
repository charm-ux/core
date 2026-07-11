import { cssVarName } from '../../helpers/cssVar.js';
import type { PrimitiveTokens, RefHelper } from '../../types/tokens.js';

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

function createFactoryRef<P extends PrimitiveTokens>(prefix: string): RefHelper<P> {
  const ref = ((...segments: (string | number)[]) => `var(${cssVarName(prefix, ...segments)})`) as RefHelper<P> & {
    ref: RefHelper<P>;
  };

  // Supports both callback styles:
  //   semantics: ref => ({ ... })
  //   semantics: ({ ref }) => ({ ... })
  ref.ref = ref;
  return ref;
}

export function resolveMaybeFactory<P extends PrimitiveTokens, T extends Record<string, unknown>>(
  input: T | ((ref: RefHelper<P>) => T) | undefined,
  prefix: string
): T | undefined {
  if (input === undefined) return undefined;
  if (typeof input === 'function') {
    return (input as (ref: RefHelper<P>) => T)(createFactoryRef<P>(prefix));
  }
  return input;
}
