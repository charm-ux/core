---
'@charm-ux/core': minor
---

[Popup] Changed presentational popups (`content-role="presentation"` or `"none"`) to render their surface as a `<div>` instead of `<dialog>`, fixing the axe `aria-allowed-role` violation in open `ch-combobox` and `ch-menu`. The `popup-base` part and `.popup` class are unchanged; code that queried `dialog` inside a presentational popup's shadow root should query `.popup` instead.
