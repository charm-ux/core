# COMP-001: Expose structure through slots, not config objects

Let consumers compose content with light-DOM children projected into named slots, rather
than passing structured content as properties. Slots keep markup declarative, preserve the
consumer's DOM (event listeners, framework bindings, accessibility relationships), and
avoid a combinatorial explosion of config props. Reserve properties for scalar
configuration (variant, size, disabled) — not for chunks of content.

**Do:**

```ts
// Template exposes default + named slots.
protected override render() {
  return html`
    <button part="button-control">
      <slot name="start"></slot>
      <slot></slot>
      <slot name="end"></slot>
    </button>
  `;
}
```

```html
<!-- Consumer composes freely. -->
<ch-button>
  <ch-icon slot="start" name="download"></ch-icon>
  Download
</ch-button>
```

**Don't:**

```ts
// Content forced through props — consumer can't nest markup, bind events, or slot icons.
@property() public label = '';
@property({ attribute: 'start-icon' }) public startIcon = '';

protected override render() {
  return html`<button>${this.startIcon ? html`<ch-icon name=${this.startIcon}></ch-icon>` : ''}${this.label}</button>`;
}
```

See also: [I18N-001](../i18n/I18N-001.md), [COMP-002](./COMP-002.md), [PROP-001](../props/PROP-001.md)
