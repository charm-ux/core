# STYLE-003: Aggregate styles with `[...super.styles, styles]`

Base classes contribute styles (host resets, focus rings, form-control layout, the
`visually-hidden` utility). A component must preserve those by spreading `super.styles`
first and appending its own module — `static override styles = [...super.styles, styles]`.
Assigning `static styles = styles` (without the spread) drops every base style and breaks
shared behavior; order matters, so keep `super.styles` first.

**Do:**

```ts
import styles from './button.styles.js';

export class CoreButton extends CharmFocusableElement {
  public static override styles = [...super.styles, styles];
}
```

**Don't:**

```ts
// Overwrites base styles — loses the focus ring, visually-hidden utility, resets, etc.
export class CoreButton extends CharmFocusableElement {
  public static override styles = styles;
}

// Wrong order — component base resets can clobber the component's own rules.
public static override styles = [styles, ...super.styles];
```

See also: [STYLE-001](./STYLE-001.md), [CHARM-001](../internal/CHARM-001.md), [A11Y-002](../accessibility/A11Y-002.md)
