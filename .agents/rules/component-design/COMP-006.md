# COMP-006: Split `render()` into small named `protected *Template()` methods

Keep `render()` thin — have it delegate to small, named `protected` template methods
(`buttonTemplate()`, `contentTemplate()`, `labelContentTemplate()`, `helpTextTemplate()`,
`errorMessageTemplate()`). This is the dominant render structure in the codebase (~36
components) and the base classes establish it. Named template methods keep `render()`
readable and — because they're `protected` — let subclasses override one piece of the
markup without reimplementing the whole template.

**Do:**

```ts
protected contentTemplate() {
  return startContentEndTemplate();
}

protected buttonTemplate() {
  const tag = this.href ? literal`a` : literal`button`;
  return html`<${tag} part="button-control">${this.contentTemplate()}</${tag}>`;
}

protected override render() {
  return this.buttonTemplate();
}
```

**Don't:**

```ts
// One monolithic render() — nothing is overridable, and it grows unreadable.
protected override render() {
  const tag = this.href ? literal`a` : literal`button`;
  return html`<${tag} part="button-control">
    <slot name="start"></slot>
    <span part="content"><slot></slot></span>
    <slot name="end"></slot>
    ${this.helpText ? html`<span part="help-text">${this.helpText}</span>` : ''}
  </${tag}>`;
}
```

See also: [COMP-007](./COMP-007.md), [COMP-001](./COMP-001.md), [COMP-003](./COMP-003.md)
