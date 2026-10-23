---
globs: packages/*/src/**/*.test.ts,packages/*/src/**/*.test-harness.ts
---

# TEST — Testing

Testing rules. Full details in [`.agents/rules/testing/`](../../.agents/rules/testing/).

- **TEST-001** — Use the test-harness pattern: thin `<name>.test.ts` entry + reusable `<name>.test-harness.ts` extending `CharmElementTests`. No ad-hoc specs in the entry file. ([details](../../.agents/rules/testing/TEST-001.md))
- **TEST-002** — Run in real browsers via `@web/test-runner` + `@open-wc/testing`; `await elementUpdated(el)` before asserting on rendered DOM. Run outside the ZD sandbox. ([details](../../.agents/rules/testing/TEST-002.md))
- **TEST-003** — Assert events with `oneEvent`, drive input with `sendKeys`, spy with `sinon`; test through public surfaces, not private internals. ([details](../../.agents/rules/testing/TEST-003.md))
- **TEST-004** — Describe component performance benchmarks as diagnostic unless explicit budget assertions make them fail. ([details](../../.agents/rules/testing/TEST-004.md))
- **TEST-005** — Unit-test shared foundation utilities directly for parsing, locale, CSS, and lifecycle edge cases. ([details](../../.agents/rules/testing/TEST-005.md))
