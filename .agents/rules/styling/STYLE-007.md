# STYLE-007: Author theme tokens as a three-tier `defineTokens` set; alias with `ref()`, extend don't fork

Theme tokens live in `packages/theming/src/themes/` and are declared in a single
`defineTokens({ primitives, semantics, components }, { prefix })` call:

- **primitives** — raw literal values (hex, px). Palette bases are literals.
- **semantics** — a `ref => ({...})` factory that aliases primitives via `ref('color', 'brand', 500)`; never a raw literal.
- **components** — a `ref => ({...})` factory keyed by the component's camelCase name (one
  `// ComponentName` comment block per component, kept in tag-name order), aliasing semantics/primitives via `ref(...)`.

Values that differ by mode are authored inline as `{ light, dark }` pairs at the leaf — there
is no separate dark-theme file. Derived themes **extend** the canonical `charmTokens` with
`.extendPrimitives()` / `.extendSemantics()` / `.extendComponents()`, overriding only what
changes; they never redefine the whole set.

**Do:**

```ts
// charm.ts
const charmTokens = defineTokens(
  {
    primitives: {
      color: { white: { light: '#ffffff', dark: '#ffffff' }, brand: '#0265dc' },
    },
    semantics: ref => ({
      surface: { primary: { light: ref('color', 'white'), dark: ref('color', 'neutral', 950) } },
    }),
    components: ref => ({
      // Button
      button: { bgColor: ref('action', 'primary'), padding: ref('spacing', 'lg') },
    }),
  },
  { prefix: 'charm' }
);

// demo.ts — extend, don't fork
export const demoTokens = charmTokens.extendPrimitives({
  color: { brand: { 500: '#3b82f6', 600: '#2563eb' } },
});
```

**Don't:**

```ts
// Raw literal in a component/semantic token defeats mode theming and the alias graph.
components: () => ({ button: { bgColor: '#0265dc' } }),

// A parallel dark-theme file duplicates structure and drifts from the light values.
export const charmDarkTokens = defineTokens({ /* ...whole set again... */ });
```

See also: [STYLE-002](./STYLE-002.md), [STYLE-009](./STYLE-009.md) (token naming grammar), [CHARM-004](../internal/CHARM-004.md)
