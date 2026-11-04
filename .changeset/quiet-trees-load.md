---
'@charm-ux/theming': patch
'@charm-ux/core': patch
---

Restore CSS reset protection against flashes of undefined custom elements, with a 200 ms fallback that keeps content accessible when components fail to load.
