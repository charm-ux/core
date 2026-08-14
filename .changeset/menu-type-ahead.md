---
'@charm-ux/core': patch
---

### Menu type-ahead

- **`ch-menu`** now supports type-ahead while open, matching the APG menu pattern: typing a
  printable character jumps focus to the first item whose label starts with the characters typed,
  with the query resetting after a 1s pause. Space only contributes to the query once it has
  started, so Space still activates a focused item. Disabled items are skipped, and the query
  buffer is cleared when the menu disconnects.
