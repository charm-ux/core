# CHARM-010: Resolve Charm tag names through the scope in DOM queries

Consumers can register components under a custom prefix or suffix
([CHARM-002](./CHARM-002.md)). A hardcoded `ch-*` tag in a query or comparison silently matches
nothing under any other scope. Resolve the tag through the current scope wherever code looks up,
matches, or compares Charm elements: `querySelector`, `querySelectorAll`, `closest`, `matches`,
and `localName` or `tagName` checks.

[CHARM-003](./CHARM-003.md) covers _rendering_ nested components (`<scoped-*>` through
`this.html`). This rule covers _finding_ them.

**Do:**

```ts
const itemTag = this.scope.tagName('breadcrumb-item');
const items = this.querySelectorAll(itemTag);
const parent = this.closest(this.scope.tagName(CoreBreadcrumb.baseName));
const isButton = el.localName === this.scope.tagName('button').toLowerCase();
```

**Don't:**

```ts
// Breaks under createScope({ prefix: 'acme' }) or a suffix.
const items = this.querySelectorAll('ch-breadcrumb-item');
const parent = this.closest('ch-breadcrumb');
```

Prefer role or attribute markers (`[role="menuitem"]`, `[menu-item]`) when a component already
sets one. Those markers don't depend on the scope at all. Add a regression test that registers
the component in a scope with a custom suffix.

See also: [CHARM-002](./CHARM-002.md), [CHARM-003](./CHARM-003.md)
