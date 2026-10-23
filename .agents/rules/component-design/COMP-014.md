# COMP-014: Position overlays through `ch-popup`, never import a positioning library directly

`@floating-ui/dom` (and the `composed-offset-position` shadow-DOM polyfill) is imported in
exactly one place — `popup.ts`. Every other overlay (tooltip, menu, dropdown, etc.) delegates
positioning to `ch-popup`: it declares `CorePopup` in `static dependencies`, renders through
`this.html` with a `<scoped-popup>` tag, and forwards parts with `exportparts`. This keeps the
shadow-DOM/`offsetParent` workarounds and the idempotent positioner lifecycle in one place.

Scrolling is a positioning input, not an implicit dismissal request: let `autoUpdate` reposition
the popup. Never assign to global browser APIs (for example `window.open`) from an unbound
listener, and do not install page-wide scroll dismissal unless it is an explicit opt-in that uses
the dismissible `request-close` flow.

**Do:**

```ts
// tooltip.ts
public static override dependencies = [CorePopup];

protected renderPopup() {
  return this.html`
    <scoped-popup
      ?active=${this.open}
      placement=${this.placement}
      exportparts="popup:tooltip__popup"
    >
      <slot></slot>
    </scoped-popup>
  `;
}
```

**Don't:**

```ts
// Re-importing floating-ui in each overlay duplicates the shadow-DOM offsetParent workaround
// and the leak-prone autoUpdate lifecycle.
import { autoUpdate, computePosition } from '@floating-ui/dom';
```

See also: [COMP-010](./COMP-010.md), [CHARM-003](../internal/CHARM-003.md), [COMP-007](./COMP-007.md)
