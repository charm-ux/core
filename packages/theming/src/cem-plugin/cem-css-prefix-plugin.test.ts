import { expect, test } from 'vitest';

import {
  ANY_PREFIX,
  applyThemePrefix,
  cssPrefixPlugin,
  DEFAULT_PREFIX,
  rewriteCssVarName,
} from './cem-css-prefix-plugin.js';

// --- Default behavior: no defaultPrefix -> replace the first `--xxxx-` segment ---

test('rewriteCssVarName replaces the first segment of an unknown prefix by default', () => {
  expect(rewriteCssVarName('--charm-overflow-item-gap', { prefix: 'acme' })).toBe('--acme-overflow-item-gap');
  expect(rewriteCssVarName('--fui-button-color', { prefix: 'acme' })).toBe('--acme-button-color');
  expect(rewriteCssVarName('--zinc-gap', { prefix: 'acme' })).toBe('--acme-gap');
});

test('rewriteCssVarName adds the target prefix to a single-segment name by default', () => {
  // No `--xxxx-` prefix to strip, so the target prefix is simply prepended.
  expect(rewriteCssVarName('--gap', { prefix: 'charm' })).toBe('--charm-gap');
});

test('rewriteCssVarName is idempotent under the default when already on the target prefix', () => {
  expect(rewriteCssVarName('--acme-overflow-item-gap', { prefix: 'acme' })).toBe('--acme-overflow-item-gap');
  const once = rewriteCssVarName('--charm-overflow-item-gap', { prefix: 'acme' });
  expect(rewriteCssVarName(once, { prefix: 'acme' })).toBe(once);
});

test('rewriteCssVarName leaves non-custom-property values untouched', () => {
  expect(rewriteCssVarName('not-a-var', { prefix: 'acme' })).toBe('not-a-var');
});

// --- Explicit defaultPrefix: string ---

test('rewriteCssVarName strips only the given string prefix, adding the target otherwise', () => {
  expect(rewriteCssVarName('--charm-overflow-item-gap', { prefix: 'acme', defaultPrefix: 'charm' })).toBe(
    '--acme-overflow-item-gap'
  );
  // No `charm-` prefix present -> first segment is preserved, target prefix added.
  expect(rewriteCssVarName('--form-control-bg-color', { prefix: 'acme', defaultPrefix: 'charm' })).toBe(
    '--acme-form-control-bg-color'
  );
});

// --- Explicit defaultPrefix: string[] ---

test('rewriteCssVarName strips any prefix in the defaultPrefix list', () => {
  const defaultPrefix = ['charm', 'fui'];
  expect(rewriteCssVarName('--fui-button-color', { prefix: 'charm', defaultPrefix })).toBe('--charm-button-color');
  expect(rewriteCssVarName('--charm-button-color', { prefix: 'charm', defaultPrefix })).toBe('--charm-button-color');
  // None of the known prefixes match -> the first segment is kept.
  expect(rewriteCssVarName('--form-control-bg-color', { prefix: 'charm', defaultPrefix })).toBe(
    '--charm-form-control-bg-color'
  );
});

// --- Explicit defaultPrefix: RegExp ---

test('rewriteCssVarName strips a leading prefix matched by a RegExp', () => {
  const defaultPrefix = /^(charm|fui)-/;
  expect(rewriteCssVarName('--fui-button-color', { prefix: 'charm', defaultPrefix })).toBe('--charm-button-color');
  // No match at the start -> first segment kept, only the target prefix added.
  expect(rewriteCssVarName('--form-control-bg-color', { prefix: 'charm', defaultPrefix })).toBe(
    '--charm-form-control-bg-color'
  );
});

test('rewriteCssVarName auto-anchors an unanchored RegExp and ignores the g flag', () => {
  // Unanchored + global: must still only strip from the start, statelessly across calls.
  const defaultPrefix = /(charm|fui)-/g;
  expect(rewriteCssVarName('--fui-a', { prefix: 'x', defaultPrefix })).toBe('--x-a');
  expect(rewriteCssVarName('--fui-a', { prefix: 'x', defaultPrefix })).toBe('--x-a');
  // A "charm-" appearing mid-name must not be stripped.
  expect(rewriteCssVarName('--my-charm-thing', { prefix: 'x', defaultPrefix })).toBe('--x-my-charm-thing');
});

test('ANY_PREFIX is the default and swaps an unknown leading prefix', () => {
  expect(rewriteCssVarName('--zinc-button-color', { prefix: 'charm' })).toBe(
    rewriteCssVarName('--zinc-button-color', { prefix: 'charm', defaultPrefix: ANY_PREFIX })
  );
});

// --- Empty target prefix strips instead of adding ---

test('rewriteCssVarName strips the prefix when the target is empty', () => {
  expect(rewriteCssVarName('--charm-overflow-item-gap', { prefix: '' })).toBe('--overflow-item-gap');
  // A single-segment name has nothing to strip and no prefix to add.
  expect(rewriteCssVarName('--gap', { prefix: '' })).toBe('--gap');
});

// --- applyThemePrefix ---

const buildManifest = () => ({
  modules: [
    {
      declarations: [
        {
          kind: 'class',
          name: 'CharmFormControlElement',
          cssProperties: [
            { name: '--charm-form-control-bg-color', description: 'bg' },
            { name: '--charm-overflow-item-gap', description: 'gap' },
          ],
        },
        { kind: 'variable', name: 'somethingElse' },
      ],
    },
    { kind: 'javascript-module', path: 'no-declarations.ts' },
  ],
});

test('applyThemePrefix rewrites every cssProperty name in place and counts changes', () => {
  const manifest = buildManifest();
  const changed = applyThemePrefix(manifest, { prefix: 'acme' });

  expect(changed).toBe(2);
  expect(manifest.modules![0].declarations![0].cssProperties!.map(p => p.name)).toEqual([
    '--acme-form-control-bg-color',
    '--acme-overflow-item-gap',
  ]);
});

test('applyThemePrefix leaves an already-normalized manifest unchanged (idempotent)', () => {
  const manifest = buildManifest();
  applyThemePrefix(manifest, { prefix: 'acme' });
  const changed = applyThemePrefix(manifest, { prefix: 'acme' });
  expect(changed).toBe(0);
});

test('applyThemePrefix tolerates a malformed manifest', () => {
  expect(applyThemePrefix(null, { prefix: 'acme' })).toBe(0);
  expect(applyThemePrefix({}, { prefix: 'acme' })).toBe(0);
  expect(applyThemePrefix({ modules: [{}] }, { prefix: 'acme' })).toBe(0);
});

// --- cssPrefixPlugin ---

test('cssPrefixPlugin defaults to the theme prefix and first-segment replacement', () => {
  const plugin = cssPrefixPlugin();
  expect(plugin.name).toBe('charm-css-prefix');

  const manifest = buildManifest();
  plugin.packageLinkPhase({ customElementsManifest: manifest });

  expect(manifest.modules![0].declarations![0].cssProperties!.map(p => p.name)).toEqual([
    `--${DEFAULT_PREFIX}-form-control-bg-color`,
    `--${DEFAULT_PREFIX}-overflow-item-gap`,
  ]);
});

test('cssPrefixPlugin honors an explicit prefix option', () => {
  const plugin = cssPrefixPlugin({ prefix: 'acme' });
  const manifest = buildManifest();
  plugin.packageLinkPhase({ customElementsManifest: manifest });

  expect(manifest.modules![0].declarations![0].cssProperties!.map(p => p.name)).toEqual([
    '--acme-form-control-bg-color',
    '--acme-overflow-item-gap',
  ]);
});

test('cssPrefixPlugin honors an explicit defaultPrefix to scope stripping', () => {
  const plugin = cssPrefixPlugin({ prefix: 'charm', defaultPrefix: 'charm' });
  const manifest = {
    modules: [
      {
        declarations: [{ kind: 'class', name: 'X', cssProperties: [{ name: '--form-control-bg-color' }] }],
      },
    ],
  };
  plugin.packageLinkPhase({ customElementsManifest: manifest });

  // With defaultPrefix 'charm', an unprefixed name keeps its first segment.
  expect(manifest.modules[0].declarations[0].cssProperties[0].name).toBe('--charm-form-control-bg-color');
});
