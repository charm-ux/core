---
'@charm-ux/core': minor
---

### Badge start and end slots

`<ch-badge>` now supports `start` and `end` slots for placing decorative content, such as an icon,
before or after the badge text, mirroring the pattern used by `<ch-accordion-item>` and
`<ch-menu-item>`.

- `@slot start` — content rendered before the badge content.
- `@slot end` — content rendered after the badge content.
- `@csspart badge-start` — container that wraps the `start` slot.
- `@csspart badge-end` — container that wraps the `end` slot.
- `@cssprop --charm-badge-gap` — spacing between the start slot, content, and end slot (backed by a
  `gap` badge token, defaulting to the `sm` spacing primitive).
