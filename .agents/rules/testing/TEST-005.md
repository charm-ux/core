# TEST-005: Unit-test foundation utilities directly

Component tests provide integration coverage, but they are not a substitute for direct tests of
shared utilities that parse input, normalize locale data, coordinate lifecycle state, or transform
consumer-provided CSS. These modules have edge cases that can be masked by a component's rendering
and are reused by many components.

Add focused `*.test.ts` coverage next to a foundation module when changing it. Test both normal
behavior and boundary cases (for example, Unicode digits, non-Gregorian locale defaults, empty
slot names, CSS whitespace, nested at-rules, observer re-arming, and timer cleanup). Prefer pure
input/output tests; use a browser only when DOM or platform behavior is part of the contract.

**Do:**

```ts
describe('normalizeInputDigits', () => {
  it('preserves Arabic-Indic and full-width digits as ASCII digits', () => {
    expect(normalizeInputDigits('١٢ １２')).to.equal('1212');
  });
});
```

**Don't:**

```ts
// Rely only on a date-picker interaction test to indirectly cover shared parsing behavior.
```

See also: [TEST-001](./TEST-001.md), [TEST-002](./TEST-002.md), [PERF-002](../performance/PERF-002.md)
