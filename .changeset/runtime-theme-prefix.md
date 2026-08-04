---
'@charm-ux/core': minor
---

[CharmElement] Added render-time prefix transformation for styles and templates so prefixes can be configured after import

Lit `css` and `html` templates evaluate at module load, which baked `--charm-*` custom-property
names and hard-coded tag names in before a downstream library had any chance to configure them.
`CharmElement` now transforms both at render time, caching the results.

The authoring API is unchanged — components still declare `static styles = css\`…\``.

**Styles.** `createRenderRoot()` rewrites `--charm-*` to the configured theme prefix and adopts the
result, caching transformed stylesheets per component class per prefix.

**Templates.** A new opt-in `this.html` tag rewrites `<scoped-*>` tags to the element's registered
scope, caching transformed strings per call site per scope:

```ts
protected override render() {
  return this.html`<scoped-icon name="more"></scoped-icon>`;
}
```

`${this.scope.tag('icon')}` with `static-html` continues to work and is still required for
polymorphic tags (COMP-003).

- Added `getThemePrefix()` and `DEFAULT_THEME_PREFIX` exports to `@charm-ux/core`.
- `setThemePrefix()` (and `new CharmProject({ tokenPrefix })`) no longer warns when called after
  component styles have been evaluated, since the prefix now applies to elements created afterwards.
  `setThemeDefinition()` still warns, because baked token _values_ cannot be rewritten this way.
