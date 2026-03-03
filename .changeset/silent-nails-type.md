---
'@charm-ux/core': minor
---

Fix dark mode styling for alert, divider, and radio group components

- Add --alert-bg-color and --alert-fg-color token support to alert component

- Replace hardcoded black color with inherit and add --divider-fg-color token to divider component

- Override inherited form-control background and height in radio group to prevent light gray background in dark mode
