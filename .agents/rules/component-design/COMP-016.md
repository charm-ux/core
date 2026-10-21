# COMP-016: Prefer `protected` members for component extension points

Components are designed to be extended. A `private` field, getter, or method is invisible to
subclasses, so it permanently prevents them from adapting state, rendering helpers, event
handlers, or interaction logic. Default to `protected` for component internals that a
subclass could reasonably need to override, and reserve `private` for details that are
strictly local and have no extension value.

This applies to `@state()` fields, computed getters, template helpers, keyboard/pointer
handlers, and behavior methods — not just `render()`. Use `public` only for the actual public
API; `protected` keeps internals out of the consumer-facing surface while remaining
overridable.

**Do:**

```ts
export class CoreCalendar extends CharmFocusableElement {
  @state()
  protected currentMonth = startOfMonth(todayDate());

  protected get selectedDates(): Date[] {
    /* ... */
  }

  protected createDayContext(): CalendarDayContext {
    /* ... */
  }

  protected handleDayKeyDown(date: Date, event: KeyboardEvent): void {
    /* ... */
  }
}
```

**Don't:**

```ts
export class CoreCalendar extends CharmFocusableElement {
  @state()
  private currentMonth = startOfMonth(todayDate()); // cannot be adjusted by a subclass

  private get selectedDates(): Date[] {
    /* ... */
  }

  private createDayContext(): CalendarDayContext {
    /* ... */
  }

  private handleDayKeyDown(date: Date, event: KeyboardEvent): void {
    /* ... */
  }
}
```

See also: [CODE-002](../code/CODE-002.md), [COMP-006](./COMP-006.md), [CHARM-001](../internal/CHARM-001.md)
