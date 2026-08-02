# STYLE-009: Follow the ADR-0001 token naming grammar

**This rule is the canonical, living source of the token naming convention.** When the
convention changes, update this file. [ADR-0001](../../../.adrs/0001-design-token-naming-convention.md)
records the _decision and rationale_ behind the convention; [STYLE-007](./STYLE-007.md)
covers the `defineTokens()` structure.

Token names are a public, hard-to-reverse contract — the emitted CSS custom property is the
kebab-case token path, and consumers override and consume those names. Name every token per
the slot grammar:

```
<category> [.<role>] [.<state>…] .<property>
```

- **Paths** — segments are lowerCamelCase in source and kebab-case in the emitted CSS variable
  (`component('menu', 'item', 'radio', 'activeBorderColor')` →
  `--charm-menu-item-radio-active-border-color`).
- **States nest** — `hover`, `active`, `focus`, `disabled`, `checked`, `unchecked`, `pressed`
  are sub-groups, never flattened into a leaf name (`primaryHover`, `inputHoverBgColor`,
  `checkedHoverFgColor` are violations). Conditional states (`checked`/`unchecked`) come
  before interaction states (`checkbox.checked.hover.bgColor`, never the reverse).
- **Spacing** — `gap` for spacing _between_ elements; `padding`/`paddingX`/`paddingY` for
  internal space; `margin` only for explicit offsets. Never suffix a token `Spacing`
  (`tabs.tablistSpacing` → `tabs.tablistGap`).
- **Colors** — backgrounds and surface fills are `bgColor`; the generic component foreground is
  `fgColor` (`button.fgColor`, `formControl.fgColor`). Text-scoped element groups drop `fg`:
  a `label`, `placeholder`, `helpText`, or `message` color leaf is `color`
  (`formControl.label.color`, `spinner.labelColor`, `formControl.placeholderColor`); an
  icon-scoped color is `iconColor` (the role already conveys foreground — `iconFgColor`,
  `labelFgColor`, `placeholderFgColor` are violations). Elements with both a foreground and a
  fill keep the full pair (`indicatorFgColor`/`indicatorBgColor`, `optionFgColor`/`optionBgColor`).
  Other role colors keep a `Color` suffix (`trackColor`, `dividerColor`, `backdropColor`).
  Never `backgroundColor` / `foregroundColor`, and never drop the `Color` suffix.
- **Shadows** — leaf `shadow`, never `boxShadow`.
- **Borders** — decompose into `borderWidth` + `borderStyle` + `borderColor`; sizing uses
  `borderWidth`, never `borderSize`.
- **Components** — a registered component is a top-level camelCase group
  (`tab-panel` → `tabPanel`); an anonymous sub-structure nests under its owner
  (`menu.item`, `dialog.closeButton`).
- **Scale steps** — numeric notation: `3xs`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`,
  `3xl`; palette steps are numeric segments (`primitive('color', 'brand', 500)`). Never
  `xxs`/`xxxl`.

## Changing the convention

The naming is frozen after the 1.0 contract (see ADR-0001); until then, a change lands by:

1. Updating **this file** — it is the canonical source.
2. Adding a **changeset** entry for every consumer-facing rename (see PROC-001).
3. **Regenerating** the theme artifacts and manifest (`pnpm analyze`, `pnpm generate:theme`,
   rebuilding `@charm-ux/theming` first) and re-running the theming + component tests.
4. **Not** rewriting ADR-0001 — it records the decision and rationale only.

**Do:**

```ts
components: () => ({
  radio: {
    bgColor: ref('surface', 'primary'),
    checked: {
      bgColor: ref('action', 'primary', 'color'),
      hover: { borderColor: ref('action', 'primary', 'hover', 'color') },
    },
    label: { disabled: { color: ref('disabled', 'fgColor') } },
  },
  tabs: { tablistGap: ref('spacing', 'md') },
}),
```

**Don't:**

```ts
components: () => ({
  radio: {
    backgroundColor: ref('surface', 'primary'), // → bgColor
    checkedHoverBorderColor: ref('action', 'primary', 'hover', 'color'), // → checked.hover.borderColor
    label: { disabledColor: ref('disabled', 'fgColor') }, // → label.disabled.color
  },
  tabs: { tablistSpacing: ref('spacing', 'md') }, // → tablistGap
}),
```

See also: [STYLE-007](./STYLE-007.md), [CHARM-004](../internal/CHARM-004.md), [ADR-0001](../../../.adrs/0001-design-token-naming-convention.md)
