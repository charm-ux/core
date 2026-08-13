---
'@charm-ux/core': minor
---

### Avatar image fallback, lazy loading, and default icon

`<ch-avatar>` now handles image load failures and ships a built-in fallback chain.

- **Image error handling**: when the `image` fails to load, the avatar falls back to `initials` (or the
  default icon) and emits a new `avatar-error` event. Supplying a new `image` source resets the error
  so the new src is retried. Previously a broken image rendered the browser's missing-image glyph
  with no fallback and no signal.
- **`loading` property**: `loading="eager" | "lazy"` is passed through to the `<img>` element, so
  avatar images can be lazily loaded.
- **Default icon fallback**: when no `image`, `initials`, or slot content is present, a default person
  icon is rendered instead of an empty background.
- **Cleanup**: the avatar now renders exactly one of image / initials / icon instead of always
  rendering an empty initials wrapper alongside an image.
- **Accessibility**: the initials and default-icon fallbacks are labeled as images (`role="img"` +
  `aria-label` from `label`), matching the image path.
