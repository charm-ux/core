# PERF — Performance-first constraints (always applied)

Performance is a non-negotiable requirement for all changes. Full details in [`.agents/rules/performance/`](../../.agents/rules/performance/).

- **PERF-001** — Ruthlessly prioritize performance in every change: choose lower-cost designs by default, avoid unnecessary render/update work, minimize layout/reflow churn, and tear down observers/listeners/timers symmetrically. Preserve and enforce performance budgets. ([details](../../.agents/rules/performance/PERF-001.md))
- **PERF-002** — Enforce performance with explicit budget assertions in `*.performance.ts` (median of warmed-up samples, generous fixed threshold) for hot paths that scale with input size; treat regressions as blockers unless documented, and justify any budget relaxation in PR notes. ([details](../../.agents/rules/performance/PERF-002.md))
