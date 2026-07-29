# CHARM-009: Use correct JSDoc annotation tags

The custom-elements manifest analyzer recognizes a specific set of JSDoc tags. Use the exact tag names listed below:

| Purpose              | Correct tag   | Incorrect variant(s) |
| -------------------- | ------------- | -------------------- |
| CSS custom property  | `@cssprop`    | `@cssproperty`       |
| CSS shadow part      | `@csspart`    | `@part`              |
| Custom event         | `@event`      | `@fires`, `@emits`   |
| Named slot           | `@slot`       | —                    |
| Component dependency | `@dependency` | `@dependencies`      |

Tag names are matched exactly by `@custom-elements-manifest/analyzer` and `@wc-toolkit/cem-*` plugins — using a wrong tag means the annotation is silently dropped from the generated manifest, and consumers never see it in docs or editor autocomplete.

### `@dependency` values must be class names

The `@dependency` value must match the **exported class name** (e.g. `CoreIcon`, `CorePopup`), not the tag name (`ch-icon`), not a lowercased shorthand (`icon`). This is the name consumers look for in the manifest's `dependencies` array and the name that matches the import in `static dependencies`.

**Do:**

```ts
/**
 * @dependency CoreIcon
 */
export class CoreDialog extends CharmDismissibleElement {
  public static override get dependencies() {
    return [CoreIcon];
  }
}
```

**Don't:**

```ts
/**
 * @dependency icon        // lowercase — doesn't match the class name
 * @dependency ch-icon     // tag name — not a class reference
 */
export class CoreDialog extends CharmDismissibleElement {
  public static override get dependencies() {
    return [CoreIcon];
  }
}
```

### General tag usage

**Do:**

```ts
/**
 * @cssprop --charm-button-bg-color - Sets the background color of the button.
 * @csspart button-control - The component's base wrapper.
 * @event {DialogRequestCloseEvent} dialog-request-close - Fired when the dialog requests to close.
 * @dependency CoreIcon
 */
export class CoreButton extends CharmFocusableElement {}
```

**Don't:**

```ts
/**
 * @cssproperty --charm-button-bg-color - Sets the background color.
 *   ↑ Incorrect — analyzer silently ignores this tag.
 * @csspart button-control
 * @fires dialog-request-close
 *   ↑ Incorrect — should be @event.
 */
```

When adding a JSDoc tag to a component class, verify the tag name against the table above. If you find a tag variant not listed, add it to the **Incorrect** column in this rule or fix it to the correct form.

See also: [CHARM-005](./CHARM-005.md), [PROP-005](../props/PROP-005.md)
