# COMP-017: Cross shadow roots with the shared composed-tree helpers

`Element.closest()` and `Node.contains()` stop at shadow-root boundaries. Code that needs to
know "is this node inside me?" or "what `lang` applies here?" must walk the composed tree.
Don't hand-roll the walk. Use the shared helpers:

- **Containment:** `composedContains(container, node)` from `src/internal/composed-contains.ts`.
  It walks `parentNode` and crosses to `ShadowRoot.host` only at the shadow root. A walk that
  jumps from any node inside a shadow root straight to `root.host` skips the ancestors in the same
  root, and gives the wrong answer for nested panes and overflow containers.
- **Inherited language:** `LocaleController` from `src/controller/locale.ts`
  ([I18N-003](../i18n/I18N-003.md)). It resolves `lang` across shadow hosts, observes only the
  ancestors that can change the result, retargets when the nearest `lang` changes, and
  disconnects on host disconnect.

If a third composed-tree need comes up, add it next to these helpers with a unit test
([TEST-005](../testing/TEST-005.md)) instead of copying a loop into a component.

**Do:**

```ts
import { composedContains } from '../../internal/composed-contains.js';

protected isWithinPane(node: Node | null) {
  return composedContains(this, node);
}
```

```ts
private readonly locale = new LocaleController(this);
// this.locale.locale is the normalized effective locale
```

**Don't:**

```ts
// Jumps to the host from anywhere in the root, skipping same-root ancestors.
while (node) {
  if (node === this) return true;
  const root = node.getRootNode();
  node = root instanceof ShadowRoot ? root.host : node.parentNode;
}

// Stops at the first shadow root and never retargets.
const lang = this.closest('[lang]')?.getAttribute('lang');
```

See also: [COMP-011](./COMP-011.md), [I18N-003](../i18n/I18N-003.md), [A11Y-014](../accessibility/A11Y-014.md)
