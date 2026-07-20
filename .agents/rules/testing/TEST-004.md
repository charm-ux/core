# TEST-004: Ship a `*.performance.ts` render-time budget for every component

Every component includes a `<name>.performance.ts` file that asserts render time stays
under a fixed millisecond budget, using `web-test-runner-performance`. This catches
performance regressions per component. Register the component through `createScope` (as the
harness does), then assert `testRenderTime(...).duration` against the component's budget.
Keep the (currently stubbed) bundle-size assertion shape in place as a TODO so it can be
enabled later.

Run these separately from unit tests: `pnpm test:core-performance`.

**Do:**

```ts
it(`should render under 20ms`, async () => {
  expect((await testRenderTime(element)).duration).to.be.lessThan(20);
});

// TODO: enable bundle-size budget
// it('should be under Xkb', async () => { ... });
```

**Don't:**

```ts
// Shipping a component with no .performance.ts — no regression guard on render cost.
// (or) removing the budget assertion because it's inconvenient.
```

See also: [TEST-001](./TEST-001.md), [DOC-002](../documentation/DOC-002.md)
