# PERF-002: Enforce performance with explicit tests and budgets

Performance requirements are only real when they are measured and gated. For any
consumer-visible component behavior that can regress in cost, keep an explicit performance
test and budget in place.

`*.performance.ts` files have two parts ([TEST-004](../testing/TEST-004.md)): the diagnostic
`benchmarkComponentPerformance` report, and explicit budget assertions (`expect(median).to.be.lessThan(budgetMs)`).
Only the assertions are budgets. When a change touches a hot path that can scale with item count
or input size (keyboard navigation over many options, overflow measurement, positioning), add a
budget assertion for that operation. Measure the median over warmed-up samples, and set the
threshold well above normal so it catches order-of-magnitude regressions rather than machine noise.
Treat failing budget assertions as merge blockers unless a deliberate trade-off is documented and
reviewed.

When touching performance-sensitive code:

- Keep or add the relevant performance test alongside the change.
- Maintain a stable, fixed threshold when practical; only relax thresholds with a written reason.
- Document intentional regressions in the PR description and explain why lower-cost options were rejected.
- Run the same local gate expected by process rules before PR (`pnpm lint && pnpm test && pnpm build`).

**Do:**

```ts
// checkbox-group.performance.ts — median of warmed-up samples against a generous fixed budget
it('moves the active listbox option among 100 options within budget', async () => {
  const budgetMs = 50;
  const samples: number[] = [];
  for (let iteration = 0; iteration < 23; iteration++) {
    const start = performance.now();
    element.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, composed: true, key: 'ArrowDown' })
    );
    await element.updateComplete;
    if (iteration >= 3) samples.push(performance.now() - start);
  }
  const median = samples.sort((a, b) => a - b)[Math.floor(samples.length / 2)];
  expect(median).to.be.lessThan(budgetMs);
});

// If the budget must change, document why in PR notes and keep the threshold explicit.
it('moves the active option within budget', async () => {
  expect(median).to.be.lessThan(60); // raised from 50: <reason in PR notes>
});
```

**Don't:**

```ts
// Removing or skipping the performance assertion to get a PR through.
it.skip('moves the active option within budget', async () => {
  expect(median).to.be.lessThan(50);
});

// Relaxing thresholds with no rationale or review trail.
it('moves the active option within budget', async () => {
  expect(median).to.be.lessThan(500);
});
```

See also: [PERF-001](./PERF-001.md), [TEST-004](../testing/TEST-004.md), [PROC-002](../process/PROC-002.md)
