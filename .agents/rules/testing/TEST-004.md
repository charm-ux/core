# TEST-004: Report component performance benchmarks accurately

Components include a `<name>.performance.ts` benchmark using `benchmarkComponentPerformance`
from `internal/testing/component-performance.ts`. The helper records mount, rerender, and bulk
mount timing summaries for the `performanceReporter`; these are currently diagnostic benchmarks,
not enforced per-component time budgets. Do not describe them as failing budgets until an
explicit threshold assertion is implemented.

Run these separately from unit tests: `pnpm test:core-performance`.
Run bulk counts sequentially to avoid benchmark contention, and exclude production benchmark
entries from the source-run glob when they import `dist`.

**Do:**

```ts
await benchmarkComponentPerformance({
  name: 'button',
  create: () => document.createElement('ch-button'),
  update: element => (element as CharmButton).requestUpdate(),
});
```

**Don't:**

```ts
// Running bulk scenarios concurrently, which contaminates timing samples.
```

See also: [TEST-001](./TEST-001.md), [DOC-002](../documentation/DOC-002.md)
