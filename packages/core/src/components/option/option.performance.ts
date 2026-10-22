import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('option performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkComponentPerformance({
      name: 'option',
      create: () => {
        const element = document.createElement('ch-option');
        element.setAttribute('value', '0');
        element.textContent = 'Option';
        return element;
      },
      update: (element, iteration) => {
        element.setAttribute('label', `Option ${iteration}`);
      },
    }));
});
