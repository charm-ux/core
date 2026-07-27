---
globs: packages/*/src/components/**/*.ts
---

# COMP — Component design

Custom-element design rules. Full details in [`.agents/rules/component-design/`](../../.agents/rules/component-design/).

- **COMP-001** — Expose structure through slots (default + named), not content-carrying config props. ([details](../../.agents/rules/component-design/COMP-001.md))
- **COMP-002** — Keep Shadow DOM encapsulation; expose styling via `part=` and `--charm-*` custom properties, not by leaking internals. ([details](../../.agents/rules/component-design/COMP-002.md))
- **COMP-003** — Render polymorphic tags (e.g. `<a>` vs `<button>`) with `literal` from `lit/static-html.js`, not duplicated templates. ([details](../../.agents/rules/component-design/COMP-003.md))
- **COMP-004** — Do DOM-dependent work in `connectedCallback`/`firstUpdated`/`updated`, not the constructor; tear down listeners/observers in `disconnectedCallback`. ([details](../../.agents/rules/component-design/COMP-004.md))
- **COMP-005** — Keep components headless and self-contained: no app state/stores, no un-cleaned global side effects; communicate via events + properties. ([details](../../.agents/rules/component-design/COMP-005.md))
- **COMP-006** — Keep `render()` thin; delegate to small named `protected *Template()` methods so subclasses can override pieces. ([details](../../.agents/rules/component-design/COMP-006.md))
- **COMP-007** — Compose the start/default/end slot triad from the shared `src/templates/` helpers (`startContentEndTemplate`), not hand-rolled scaffolding. ([details](../../.agents/rules/component-design/COMP-007.md))
- **COMP-008** — Detect slotted content with `HasSlotController` (+ `[default]` sentinel), not manual `slotchange` listeners. ([details](../../.agents/rules/component-design/COMP-008.md))
- **COMP-009** — `@queryAssignedElements({selector,slot,flatten})` for slotted children, `@query` for shadow nodes; no `@queryAssignedNodes`. ([details](../../.agents/rules/component-design/COMP-009.md))
- **COMP-010** — Make positioner/observer `start()` idempotent: store the cleanup handle and dispose the previous one before re-arming, or orphaned observers keep firing (session hangs). ([details](../../.agents/rules/component-design/COMP-010.md))
- **COMP-011** — Mirror every `addEventListener`/`observe()` with a `removeEventListener`/`disconnect()` across connect/disconnect via symmetric methods; guard observer callbacks with `if (this.isConnected)`. ([details](../../.agents/rules/component-design/COMP-011.md))
- **COMP-012** — Store timer handles in a field; `clearTimeout` before re-arming and in `disconnectedCallback`. ([details](../../.agents/rules/component-design/COMP-012.md))
- **COMP-013** — Bind optional attributes with `ifDefined()` (from `lit/directives/if-defined.js`) so `undefined` removes the attribute instead of rendering `"undefined"`/empty. ([details](../../.agents/rules/component-design/COMP-013.md))
- **COMP-014** — Position overlays through `ch-popup` (static dependency + `scope.tag('popup')`); `@floating-ui/dom` is imported only in `popup.ts`. ([details](../../.agents/rules/component-design/COMP-014.md))
- **COMP-015** — Drive show/hide from a reactive `visible` state settled on `transitionend` with a `transitionMaxTime + 50` fallback timer; reuse `CharmDismissibleElement`. ([details](../../.agents/rules/component-design/COMP-015.md))
