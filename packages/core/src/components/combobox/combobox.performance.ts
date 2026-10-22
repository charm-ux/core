import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import { composedPerformanceOptions } from '../../internal/testing/component-performance-cases.js';
import '../option/index.js';
import '../option-group/index.js';
import './index.js';
import type { CoreCombobox } from './index.js';

const createOptions = (count: number) =>
  Array.from(
    { length: count },
    (_, index) => `<ch-option value="${index}">${String.fromCharCode(97 + (index % 26))} option ${index}</ch-option>`
  ).join('');

describe('combobox performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkComponentPerformance(
      {
        name: 'combobox-with-options',
        create: () => {
          const element = document.createElement('ch-combobox') as CoreCombobox;
          element.setAttribute('label', 'Option');
          element.innerHTML = Array.from(
            { length: 20 },
            (_, index) => `<ch-option value="${index}">Option ${index}</ch-option>`
          ).join('');
          return element;
        },
        update: (element, iteration) => {
          (element as CoreCombobox).value = String(iteration % 20);
        },
      },
      composedPerformanceOptions
    ));

  it('reports value changes against a large collection', () =>
    benchmarkComponentPerformance(
      {
        name: 'combobox-large-collection',
        create: () => {
          const element = document.createElement('ch-combobox') as CoreCombobox;
          element.setAttribute('label', 'Option');
          element.innerHTML = createOptions(500);
          return element;
        },
        update: (element, iteration) => {
          (element as CoreCombobox).value = String(iteration % 500);
        },
      },
      composedPerformanceOptions
    ));

  it('reports typing that filters and opens a large collection', () =>
    benchmarkComponentPerformance(
      {
        name: 'combobox-large-collection-typing',
        create: () => {
          const element = document.createElement('ch-combobox') as CoreCombobox;
          element.setAttribute('label', 'Option');
          element.innerHTML = createOptions(500);
          return element;
        },
        update: (element, iteration) => {
          const input = (element as CoreCombobox).shadowRoot?.querySelector<HTMLInputElement>('.combobox-input');
          if (!input) return;
          input.value = String.fromCharCode(97 + (iteration % 26));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        },
      },
      composedPerformanceOptions
    ));
});
