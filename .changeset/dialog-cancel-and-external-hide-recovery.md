---
'@charm-ux/core': patch
---

### Dialog cancel handling and external-hide recovery

`<ch-dialog>` now intercepts the native `cancel` event so Escape closes through Charm's transition
and event flow.

- The native `cancel` event is intercepted and `preventDefault()`ed, so the native dialog never
  closes itself outside Charm's transition flow and the close runs through
  `dialog-request-close` with a `keyboard` source.
- The browser natively targets `cancel` at the correct dialog in the top layer, so nested dialogs
  keep their native Escape behavior: the topmost dialog closes on Firefox and WebKit, while
  Chromium closes each nested dialog in sequence.
- The dialog now watches its own render state while open. If third-party CSS (e.g. cookie banner
  blockers) hides an open dialog, the modal is suspended so the page isn't left scroll locked and
  inert, and it resumes when the dialog is rendered again.
- The dialog host is always `display: block`. It is empty while closed (the internal dialog is
  `display: none`), and while open it generates a layout box the render watcher uses to detect when
  the host stops rendering. Keeping the host rendered on close also lets the fade-out transition
  play through to `transitionend` instead of being hidden the moment the `open` attribute drops.
