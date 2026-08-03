---
'@charm-ux/core': patch
'@charm-ux/theming': patch
---

### Styles, transitions, and rendering fixes

- Global: add a reduced-motion base rule in core; status indicators (spinner, progress-bar, skeleton) opt back into motion at the component level with slowed fallbacks.
- Entry/start transitions: add @starting-style fallbacks for alert, dialog, popup, and tooltip so components fade/slide in instead of snapping on first render.
- Dialog: expose transition/inset as CSS properties, wire drawer position transitions to --dialog-position-transition, and add start transforms for slide drawers.
- Popup & Menu: move popup drop-shadow to the popup element, surface popup transition CSS props from menu (tokens.prop), fix exportparts and remove the menu-panel's premature hidden binding so popup manages hide/show.
- Accessibility/rendering: popup now sets popup.hidden in firstUpdated to avoid closed popups being hit-testable or in the accessibility tree.
- Accordion & Disclosure: use transition longhands and transition-behavior: allow-discrete; enable interpolate-size and change openedMaxHeight token to "max-content" so show/hide animate.
- Progress bar / Spinner / Skeleton: enable indeterminate animation, correct spinner keyframe references, and add reduced-motion handling.
- Theming: update tokens to match stylesheet expectations (openedMaxHeight, progress indeterminate animation, spinner keyframe names).
