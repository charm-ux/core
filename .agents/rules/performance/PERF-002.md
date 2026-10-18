# PERF-002: Enforce performance with explicit tests and budgets

Performance requirements are only real when they are measured and gated. For any
consumer-visible component behavior that can regress in cost, keep an explicit performance
test and budget in place.

Use [TEST-004](../testing/TEST-004.md) as the baseline mechanism (`*.performance.ts` with
fixed render-time budgets). Treat budget tests as merge blockers when they regress unless a
deliberate trade-off is documented and reviewed.

When touching performance-sensitive code:

- Keep or add the relevant performance test alongside the change.
- Maintain a stable, fixed threshold when practical; only relax thresholds with a written reason.
- Document intentional regressions in the PR description and explain why lower-cost options were rejected.
- Run the same local gate expected by process rules before PR (`pnpm lint && pnpm test && pnpm build`).

**Do:**

```ts
it('should render under 20ms', async () => {
  expect((await testRenderTime(element)).duration).to.be.lessThan(20);
});

// If the budget must change, document why in PR notes and keep the threshold explicit.
it('should render under 24ms', async () => {
  expect((await testRenderTime(element)).duration).to.be.lessThan(24);
});
```

**Don't:**

```ts
// Removing or skipping the performance assertion to get a PR through.
it.skip('should render under budget', async () => {
  expect((await testRenderTime(element)).duration).to.be.lessThan(20);
});

// Relaxing thresholds with no rationale or review trail.
it('should render under 60ms', async () => {
  expect((await testRenderTime(element)).duration).to.be.lessThan(60);
});
```

See also: [PERF-001](./PERF-001.md), [TEST-004](../testing/TEST-004.md), [PROC-002](../process/PROC-002.md)
