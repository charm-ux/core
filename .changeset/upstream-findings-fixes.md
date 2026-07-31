---
'@charm-ux/core': patch
---

### Fixes

- **Form submission**: `ch-button type="submit"` and the Enter-key path in `ch-input` now call `form.requestSubmit()` instead of `form.submit()`, so constraint validation runs and a cancelable `submit` event fires. Previously a submit button submitted an invalid form unconditionally.
- **Form state restore**: `CharmFormControlElement` now implements `formStateRestoreCallback` (restores value on bfcache/back-forward and autofill restore) and `formDisabledCallback` (reflects `disabled` when a parent `<fieldset>` disables the control).
- **Form control a11y**: controls now set `aria-invalid`, point `aria-errormessage` at the (live-region) error text only when invalid, and reference `help-text` in `aria-describedby` only when help text is present — `ch-select`, `ch-text-area`, and `ch-checkbox` no longer hardcode `aria-describedby="help-text"`. Fixed the inverted `aria-hidden` on the shared help-text container (it was hiding help text from assistive tech exactly when present).
- **`ch-spinner`**: bare `<ch-spinner>` now has a default accessible name ("Loading") instead of announcing as an unlabeled `role="status"`. Consumers can override via `label` or slot content.
- **`ch-alert`**: role is now derived from `politeness` — `polite` renders `role="status"`, `assertive` renders `role="alert"`, `off` renders neither — instead of always pairing `role="alert"` (implicitly assertive) with `aria-live="polite"`.
- **`ch-skeleton`**: placeholders are now `aria-hidden="true"` by default instead of each being a `aria-live="polite"` live region; announce loading once from a single status element instead.
- **Theming**: `setThemePrefix()` / `setThemeDefinition()` now emit a `console.warn` (dev) when called after component styles have already been evaluated, so the silent unstyled-components failure mode from calling them too late is surfaced.
- **Scope errors**: constructing a Charm component that isn't registered with a `CharmScope` (e.g. via `@customElement`) now throws a descriptive error instead of a `TypeError` on an undefined scope.
- **Docs**: corrected the stale `packages/core` README (real tags are `ch-*`, classes are `Core*`; `variant` prop removed; `generateTheme` now imported from `@charm-ux/theming`) and documented the registered vs. class-only import paths and subclassing through the project scope.
