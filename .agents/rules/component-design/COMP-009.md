# COMP-009: Query slotted children with `@queryAssignedElements`, shadow nodes with `@query`

Use the right decorator for the DOM you're reaching into:

- **`@queryAssignedElements({ selector, slot, flatten })`** — for light-DOM children
  projected into a slot (e.g. the tabs assigned to a tablist). Scope it with `selector`
  and `slot` so you get exactly the elements you expect.
- **`@query('.selector')`** — for elements inside the component's own shadow root (e.g. the
  internal `<input>` or `.control`).

Don't reach across the shadow boundary with manual `querySelector` calls sprinkled through
methods, and don't use `@queryAssignedNodes` (this codebase queries elements, not raw
nodes). Type `@query` targets and mark them `protected`; when satisfying a base-class
contract, keep the base's member name (e.g. `protected override input?`).

**Do:**

```ts
@queryAssignedElements({ selector: '[role="tab"]', flatten: true })
protected tabs!: CoreTab[];

@queryAssignedElements({ slot: 'tabpanel', selector: '[role="tabpanel"]', flatten: true })
protected panels!: HTMLElement[];

@query('.control')
protected control?: HTMLElement;
```

**Don't:**

```ts
// Untyped ad-hoc queries recomputed everywhere; brittle and unscoped.
protected get tabs() {
  return Array.from(this.querySelectorAll('*')).filter(el => el.getAttribute('role') === 'tab');
}
```

See also: [COMP-008](./COMP-008.md), [COMP-006](./COMP-006.md)
