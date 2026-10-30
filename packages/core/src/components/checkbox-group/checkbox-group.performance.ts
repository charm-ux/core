import { expect, fixture, html } from '@open-wc/testing';
import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import { createScope } from '../../utilities/index.js';
import CoreCheckbox from '../checkbox/checkbox.js';
import coreCheckboxGroup from './checkbox-group.js';

createScope({
  styles: [],
  components: [coreCheckboxGroup, CoreCheckbox],
});

describe('checkbox-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponentPerformance({
      name: 'checkbox-group',
      create: () => {
        const element = document.createElement('ch-checkbox-group') as InstanceType<typeof coreCheckboxGroup>;
        element.innerHTML = Array.from(
          { length: 5 },
          (_, index) => `<ch-checkbox value="${index}">Option ${index}</ch-checkbox>`
        ).join('');
        return element;
      },
      update: (element, iteration) => {
        (element as InstanceType<typeof coreCheckboxGroup>).valueAsArray = [String(iteration % 5)];
      },
    });

    await benchmarkComponentPerformance({
      name: 'checkbox-group/listbox-100-options',
      create: () => {
        const element = document.createElement('ch-checkbox-group') as InstanceType<typeof coreCheckboxGroup>;
        element.listbox = true;
        element.innerHTML = Array.from(
          { length: 100 },
          (_, index) => `<ch-checkbox value="${index}">Option ${index}</ch-checkbox>`
        ).join('');
        return element;
      },
      update: element => {
        element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true, key: 'ArrowDown' }));
      },
    });
  });

  // Generous budget that only catches order-of-magnitude regressions (e.g. per-keystroke work that scales with options).
  it('moves the active listbox option among 100 options within budget', async () => {
    const budgetMs = 50;
    const element = await fixture<InstanceType<typeof coreCheckboxGroup>>(html`
      <ch-checkbox-group listbox>
        ${Array.from({ length: 100 }, (_, index) => html`<ch-checkbox value=${index}>Option ${index}</ch-checkbox>`)}
      </ch-checkbox-group>
    `);
    await element.updateComplete;

    const samples: number[] = [];
    for (let iteration = 0; iteration < 23; iteration++) {
      const start = performance.now();
      element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true, key: 'ArrowDown' }));
      await element.updateComplete;
      if (iteration >= 3) samples.push(performance.now() - start);
    }

    const median = samples.sort((a, b) => a - b)[Math.floor(samples.length / 2)];
    expect(median).to.be.lessThan(budgetMs);
  });
});
