# STYLE-004: Use CSS logical properties for RTL support

Charm supports right-to-left languages, so layout styles must use CSS **logical**
properties and values rather than physical (left/right) ones. Logical properties flip
automatically with the document direction; physical ones don't, and produce mirrored,
broken layouts in RTL. The base harness even scans for direction-unsafe CSS
([TEST-003](../testing/TEST-003.md)).

| Use (logical)                   | Instead of (physical)            |
| ------------------------------- | -------------------------------- |
| `margin-inline-start` / `-end`  | `margin-left` / `margin-right`   |
| `padding-inline-start` / `-end` | `padding-left` / `padding-right` |
| `inset-inline-start` / `-end`   | `left` / `right`                 |
| `border-inline-start`           | `border-left`                    |
| `text-align: start` / `end`     | `text-align: left` / `right`     |

**Do:**

```ts
export default css`
  .control {
    padding-inline: ${component('button', 'paddingX')};
    margin-inline-start: 0.5rem;
    text-align: start;
  }
`;
```

**Don't:**

```ts
export default css`
  .control {
    padding-left: 16px; /* won't flip in RTL */
    margin-right: 8px;
    text-align: left;
  }
`;
```

See also: [I18N-002](../i18n/I18N-002.md), [TEST-003](../testing/TEST-003.md)
