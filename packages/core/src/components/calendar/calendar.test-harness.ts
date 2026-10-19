import { elementUpdated, expect } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { project } from '../../utilities/project.js';
import type { CalendarChangeEventDetail, CoreCalendar } from './index.js';

export class CoreCalendarTests<T extends CoreCalendar> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      calendar: {
        description: 'calendar',
        tests: {
          selection: {
            description: 'selection',
            tests: {
              singleDate: {
                description: 'selects one date and emits input and change events',
                test: async () => {
                  const inputHandler = sinon.spy();
                  const changeHandler = sinon.spy();
                  this.component.addEventListener('input', inputHandler);
                  this.component.addEventListener('change', changeHandler);

                  this.getDay('2025-06-15').click();
                  await elementUpdated(this.component);

                  expect(this.component.value).to.equal('2025-06-15');
                  expect(inputHandler).to.have.been.calledOnce;
                  expect(changeHandler).to.have.been.calledOnce;
                  expect(
                    (changeHandler.firstCall.args[0] as CustomEvent<CalendarChangeEventDetail>).detail.value
                  ).to.equal('2025-06-15');
                },
              },
              dateRange: {
                description: 'selects a start and end date as a range',
                test: async () => {
                  this.component.selectionMode = 'range';
                  await elementUpdated(this.component);

                  this.getDay('2025-06-10').click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.deep.equal(['2025-06-10']);

                  this.getDay('2025-06-15').click();
                  await elementUpdated(this.component);

                  expect(this.component.value).to.deep.equal(['2025-06-10', '2025-06-15']);
                  expect(this.getCell('2025-06-12').getAttribute('aria-selected')).to.equal('true');
                },
              },
              minRangeConstraint: {
                description: 'blocks range endpoints shorter than min-range',
                test: async () => {
                  this.component.selectionMode = 'range';
                  this.component.minRange = 3;
                  await elementUpdated(this.component);

                  this.getDay('2025-06-10').click();
                  await elementUpdated(this.component);

                  const tooShort = this.getDay('2025-06-11');
                  expect(tooShort.disabled).to.equal(true);

                  this.getDay('2025-06-12').click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.deep.equal(['2025-06-10', '2025-06-12']);
                },
              },
              maxRangeConstraint: {
                description: 'blocks range endpoints longer than max-range',
                test: async () => {
                  this.component.selectionMode = 'range';
                  this.component.maxRange = 3;
                  await elementUpdated(this.component);

                  this.getDay('2025-06-10').click();
                  await elementUpdated(this.component);

                  const tooLong = this.getDay('2025-06-14');
                  expect(tooLong.disabled).to.equal(true);

                  this.getDay('2025-06-12').click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.deep.equal(['2025-06-10', '2025-06-12']);
                },
              },
              multipleDates: {
                description: 'toggles independently selected dates in multiple mode',
                test: async () => {
                  this.component.selectionMode = 'multiple';
                  await elementUpdated(this.component);

                  this.getDay('2025-06-10').click();
                  this.getDay('2025-06-12').click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.deep.equal(['2025-06-10', '2025-06-12']);

                  this.getDay('2025-06-10').click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.deep.equal(['2025-06-12']);
                },
              },
            },
          },
          icons: {
            description: 'navigation icons',
            tests: {
              usesRegisteredChevronIcons: {
                description: 'uses the registered icon component for month navigation',
                test: async () => {
                  const iconTag = project.scope.tagName('icon');
                  const previousIcon = this.component.shadowRoot?.querySelector(`${iconTag}[name="chevron-left"]`);
                  const nextIcon = this.component.shadowRoot?.querySelector(`${iconTag}[name="chevron-right"]`);

                  expect(window.customElements.get(iconTag)).to.not.be.undefined;
                  expect(previousIcon).to.not.be.null;
                  expect(nextIcon).to.not.be.null;
                },
              },
            },
          },
          keyboard: {
            description: 'keyboard navigation',
            tests: {
              arrowsMoveFocus: {
                description: 'moves the roving tab stop and focus with arrow keys',
                test: async () => {
                  this.component.focusDate = '2025-06-15';
                  await elementUpdated(this.component);
                  this.getDay('2025-06-15').focus();

                  await sendKeys({ press: 'ArrowRight' });
                  await elementUpdated(this.component);

                  expect(this.getDay('2025-06-16').tabIndex).to.equal(0);
                  expect(this.component.shadowRoot?.activeElement).to.equal(this.getDay('2025-06-16'));
                },
              },
              skipsUnavailableDates: {
                description: 'skips unavailable dates during keyboard navigation',
                test: async () => {
                  this.component.focusDate = '2025-06-15';
                  this.component.disabledDates = '2025-06-16';
                  await elementUpdated(this.component);
                  this.getDay('2025-06-15').focus();

                  await sendKeys({ press: 'ArrowRight' });
                  await elementUpdated(this.component);

                  expect(this.getDay('2025-06-17').tabIndex).to.equal(0);
                },
              },
              changesMonthWithPageKeys: {
                description: 'changes the visible month with PageUp and PageDown',
                test: async () => {
                  this.component.focusDate = '2025-06-15';
                  await elementUpdated(this.component);
                  this.getDay('2025-06-15').focus();

                  await sendKeys({ press: 'PageDown' });
                  await elementUpdated(this.component);

                  expect(this.getDay('2025-07-15').tabIndex).to.equal(0);
                },
              },
              changesYearWithShiftPageDown: {
                description: 'changes the visible year with Shift+PageDown',
                test: async () => {
                  this.component.focusDate = '2025-06-15';
                  await elementUpdated(this.component);
                  this.getDay('2025-06-15').focus();

                  await sendKeys({ press: 'Shift+PageDown' });
                  await elementUpdated(this.component);

                  expect(this.getDay('2026-06-15').tabIndex).to.equal(0);
                },
              },
            },
          },
          focus: {
            description: 'focus management',
            tests: {
              oneTabStop: {
                description: 'exposes one enabled date as a tab stop',
                test: async () => {
                  const tabStops = this.component.shadowRoot?.querySelectorAll('.day[tabindex="0"]');
                  expect(tabStops?.length).to.equal(1);
                },
              },
              goToDate: {
                description: 'goes to a date without selecting it',
                test: async () => {
                  this.component.goToDate('2025-06-15');
                  await elementUpdated(this.component);

                  expect(this.getDay('2025-06-15').tabIndex).to.equal(0);
                  expect(this.component.value).to.be.undefined;
                },
              },
              monthAndYearControls: {
                description: 'changes the visible month and year with the header controls',
                test: async () => {
                  const monthSelect = this.component.shadowRoot?.querySelector<HTMLSelectElement>('#month-select');
                  const yearInput = this.component.shadowRoot?.querySelector<HTMLInputElement>('#year-input');

                  if (!monthSelect || !yearInput) throw new Error('Expected month and year controls to render.');

                  monthSelect.value = '6';
                  monthSelect.dispatchEvent(new Event('change', { bubbles: true }));
                  await elementUpdated(this.component);
                  expect(monthSelect.value).to.equal('6');

                  yearInput.value = '2026';
                  yearInput.dispatchEvent(new Event('change', { bubbles: true }));
                  await elementUpdated(this.component);

                  expect(yearInput.value).to.equal('2026');
                  expect(this.getDay('2026-07-15').tabIndex).to.equal(0);
                },
              },
            },
          },
          layout: {
            description: 'calendar layout',
            tests: {
              doesNotRenderAdjacentMonthDates: {
                description: 'leaves adjacent-month dates blank',
                test: async () => {
                  this.component.focusDate = '2026-10-01';
                  await elementUpdated(this.component);

                  expect(this.component.shadowRoot?.querySelector('[data-date="2026-09-30"]')).to.be.null;
                  expect(this.component.shadowRoot?.querySelectorAll('.grid tbody tr').length).to.equal(5);
                  expect(this.component.shadowRoot?.querySelector('#calendar-heading')?.textContent?.trim()).to.equal(
                    'October 2026'
                  );
                },
              },
              dayAndRowSizesFollowTokens: {
                description: 'sizes date cells and week rows from their CSS tokens',
                test: async () => {
                  this.component.style.setProperty('--charm-calendar-day-size', '24px');
                  this.component.style.setProperty('--charm-calendar-day-row-size', '36px');
                  await elementUpdated(this.component);

                  const day = this.getDay('2025-06-15');
                  const row = day.closest('tr');
                  expect(getComputedStyle(day).inlineSize).to.equal('24px');
                  expect(getComputedStyle(day).blockSize).to.equal('24px');
                  expect(getComputedStyle(row!).blockSize).to.equal('36px');
                },
              },
            },
          },
        },
      },
    });
  }

  private getDay(value: string): HTMLButtonElement {
    return this.component.shadowRoot?.querySelector<HTMLButtonElement>(
      `.day[data-date="${value}"]`
    ) as HTMLButtonElement;
  }

  private getCell(value: string): HTMLTableCellElement {
    return this.getDay(value).closest('td') as HTMLTableCellElement;
  }
}
