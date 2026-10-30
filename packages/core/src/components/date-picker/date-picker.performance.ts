import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../internal/testing/component-performance.js';
import './index.js';

describe('date-picker performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('date-picker', 'ch-date-picker'));

  it('benchmarks an open popup and calendar keyboard navigation', async () => {
    await benchmarkComponentPerformance(
      {
        name: 'date-picker-open-calendar-keyboard',
        create: () => {
          const picker = document.createElement('ch-date-picker') as HTMLElement & { open: boolean };
          picker.open = true;
          return picker;
        },
        update: async picker => {
          const datePicker = picker as HTMLElement & {
            updateComplete: Promise<unknown>;
            hide(): void;
            show(): void;
          };
          datePicker.hide();
          await datePicker.updateComplete;
          datePicker.show();
          await datePicker.updateComplete;
          const popup = picker.shadowRoot?.querySelector<HTMLElement & { reposition(): Promise<void> }>('.popup');
          await popup?.reposition();
          const calendar = picker.shadowRoot?.querySelector('.calendar');
          const focusedDay = calendar?.shadowRoot?.querySelector<HTMLElement>('[tabindex="0"][data-date]');
          focusedDay?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
          await (calendar as (HTMLElement & { updateComplete: Promise<unknown> }) | null)?.updateComplete;
        },
      },
      { iterations: 10, warmups: 2, bulkCounts: [10, 25] }
    );
  });
});
