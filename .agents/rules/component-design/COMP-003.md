# COMP-003: Render polymorphic tags with static-html `literal`

When a component renders as one of several native elements depending on its props (e.g. a
button that becomes an `<a>` when `href` is set), switch the tag name with a `literal` from
`lit/static-html.js` — don't duplicate the entire template per branch. Import `html` and
`literal` from `lit/static-html.js` (not the regular `lit` `html`) so the static tag
interpolates correctly.

**Do:**

```ts
import { html, literal } from 'lit/static-html.js';
import { ifDefined } from 'lit/directives/if-defined.js';

protected buttonTemplate() {
  const isLink = !!this.href;
  const tag = this.href ? literal`a` : literal`button`;

  return html`<${tag}
    part="button-control"
    href=${ifDefined(isLink ? this.href : undefined)}
    type=${ifDefined(isLink ? undefined : this.type)}
    @click=${this.handleClick}
  >
    ${this.contentTemplate()}
  </${tag}>`;
}
```

**Don't:**

```ts
// Two near-identical templates drift apart as attributes/handlers are added.
protected override render() {
  return this.href
    ? html`<a href=${this.href} @click=${this.handleClick}>${this.contentTemplate()}</a>`
    : html`<button type=${this.type} @click=${this.handleClick}>${this.contentTemplate()}</button>`;
}
```

See also: [COMP-001](./COMP-001.md), [PROP-002](../props/PROP-002.md)
