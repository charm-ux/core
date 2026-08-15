---
'@charm-ux/core': patch
'@charm-ux/theming': patch
---

Popup arrow and background now share the same color

- The popup's background is now driven by the theme's `popup.bgColor` token (exposed as `--charm-popup-bg-color` / `--popup-bg-color`), replacing the ad-hoc `--popup-background` CSS variable that hardcoded a different surface color.
- The popup arrow uses the same color as the popup's background, so the arrow and panel always match. The `popup.arrowColor` token and `--charm-popup-arrow-color` / `--popup-arrow-color` custom properties were removed; color the arrow differently with `::part(arrow)` if needed.
- Tooltip now themes its composed popup's background to match the tooltip body.
