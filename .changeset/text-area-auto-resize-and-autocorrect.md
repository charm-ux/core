---
'@charm-ux/core': minor
---

Add `resize="auto"` auto-grow mode and `autocorrect` passthrough to `ch-text-area`

- `resize="auto"` grows the textarea to fit its content and hides its scrollbar, recomputing the height
  whenever the textarea's width changes and text re-wraps.
- `autocorrect` (boolean, `on`/`off` attribute) passes through to the native `<textarea>` and `<input>`
  controls, letting consumers disable the browser's autocorrection of spelling and punctuation.
