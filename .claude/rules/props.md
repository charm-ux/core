---
globs: packages/*/src/components/**/*.ts
---

# PROP — Properties, attributes, events

Property/attribute/event rules. Full details in [`.agents/rules/props/`](../../.agents/rules/props/).

- **PROP-001** — Declare public config with `@property`; `reflect: true` for state CSS/consumers observe. Don't reflect objects/high-churn values. ([details](../../.agents/rules/props/PROP-001.md))
- **PROP-002** — camelCase property ↔ kebab-case `attribute:`; `is`/`has` or native boolean names; keep native attribute names native (`href`, `type`, `referrerpolicy`). ([details](../../.agents/rules/props/PROP-002.md))
- **PROP-003** — Emit `CustomEvent`s via the base `emit()` helper (composed by default); name them `change` or `{component}-{action}`, never `ch-`-prefixed. ([details](../../.agents/rules/props/PROP-003.md))
- **PROP-004** — Support controlled + uncontrolled usage via a reactive value property that updates internally and emits an event. ([details](../../.agents/rules/props/PROP-004.md))
- **PROP-005** — Document every property (JSDoc) and every event/slot/part (class-block tags). ([details](../../.agents/rules/props/PROP-005.md))
- **PROP-006** — Type event `detail` with an exported interface at the top of the file; emit via a `protected emitX(detail)` wrapper; document `@event {Type} name`. ([details](../../.agents/rules/props/PROP-006.md))
- **PROP-007** — Dismissible components emit via `emitScopedEvent` → `{baseName}-{action}`; user dismissal fires a cancelable `{baseName}-request-close` and only hides if not `defaultPrevented`. ([details](../../.agents/rules/props/PROP-007.md))
- **PROP-008** — `@state()` for internal/derived reactive state (not `@property`); compute derived state in `willUpdate` (call `super` first), not `updated`. ([details](../../.agents/rules/props/PROP-008.md))
- **PROP-009** — Side-effecting props are getter/setter pairs over a backing field with `requestUpdate` + a no-op guard. ([details](../../.agents/rules/props/PROP-009.md))
- **PROP-010** — Validate/coerce/normalize property values in the getter/setter pair (runs for property + attribute, skips no-op renders); defer to `willUpdate` for cross-property derivation, `updated` for DOM work. ([details](../../.agents/rules/props/PROP-010.md))
