# PROP-002: Name attributes consistently; keep native names native

Property/attribute naming follows platform conventions so the component feels like a native
element:

- Property names are camelCase; the attribute is the kebab-case form. When they differ or
  need to be explicit, set `attribute:` (e.g. `helpText` ↔ `help-text`,
  `iconOnly` ↔ `icon-only`).
- Booleans read as `is*`/`has*` or mirror native attributes (`disabled`, `open`,
  `required`). A boolean attribute is true by presence — don't design one whose "off" state
  requires `="false"`.
- When wrapping or mirroring a native element, keep the **native attribute name** and
  casing (`type`, `href`, `name`, `value`, `referrerpolicy`, `target`) so consumers'
  existing knowledge transfers.

**Do:**

```ts
@property({ type: Boolean, reflect: true, attribute: 'icon-only' })
public iconOnly?: boolean;

@property({ attribute: 'allow-wrap', type: Boolean, reflect: true })
public allowWrap? = false;

// Native attribute kept verbatim.
@property({ attribute: 'referrerpolicy' })
public referrerPolicy: string = 'strict-origin-when-cross-origin';
```

**Don't:**

```ts
// Invented camelCase attribute, and a boolean that needs an explicit "false".
@property({ attribute: 'iconOnly' })          // should be icon-only
public iconOnly?: 'true' | 'false';           // should be a real Boolean

// Renaming a native attribute for no reason breaks consumer expectations.
@property({ attribute: 'link-url' })          // should stay `href`
public href?: string;
```

See also: [PROP-001](./PROP-001.md), [PROP-004](./PROP-004.md), [COMP-003](../component-design/COMP-003.md)
