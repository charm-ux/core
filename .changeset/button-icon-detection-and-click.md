---
'@charm-ux/core': minor
---

### `ch-button` icon-only auto-detection

`<ch-button>` now detects when the default slot contains only an icon and no other visible content
and applies the icon-only spacing automatically — no `icon-only` attribute required. Detection
recognizes inline SVG, the `<ch-icon>` component, and elements carrying an `icon` attribute, and it
ignores visually-hidden labels (per A11Y-002), so a11y-friendly icon buttons keep the compact
layout. The explicit `icon-only` attribute continues to work and still wins.

### `ch-button` disabled click handling

A disabled button's click handler now calls `stopImmediatePropagation()` instead of
`stopPropagation()`, so clicks on a disabled link button are fully suppressed rather than continuing
to fire on other listeners attached to the same control.
