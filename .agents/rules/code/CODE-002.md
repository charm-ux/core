# CODE-002: Explicit member accessibility, `override`, and member ordering

The TypeScript ESLint config enforces class-authoring discipline (all as errors, and lint
runs `--max-warnings 0`):

- **`explicit-member-accessibility`** — every class member (property, method, getter,
  accessor) needs an explicit `public` / `private` / `protected` modifier.
- **`member-ordering`** — members must follow the configured order (static before
  instance, fields before methods, grouped by accessibility). Let the linter's autofix
  place them rather than guessing.
- **`noImplicitOverride`** (tsconfig) — any member that overrides a base-class member must
  carry the `override` keyword. This applies to Lit lifecycle overrides too
  (`static override styles`, `override render()`, `override connectedCallback()`).

**Do:**

```ts
export class CoreButton extends CharmFocusableElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'button';

  @property({ reflect: true })
  public type: 'button' | 'submit' | 'reset' = 'button';

  protected override render() {
    return this.buttonTemplate();
  }

  private handleClick = (event: MouseEvent) => {
    /* ... */
  };
}
```

**Don't:**

```ts
export class CoreButton extends CharmFocusableElement {
  static styles = [...super.styles, styles]; // missing `public` + `override`
  render() {
    // missing `override`
    return this.buttonTemplate();
  }
  type = 'button'; // missing accessibility modifier
}
```

See also: [CODE-004](./CODE-004.md), [CHARM-007](../internal/CHARM-007.md)
