import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import '../option/index.js';
import './index.js';

describe('option group performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkComponentPerformance({
      name: 'option-group-with-options',
      create: () => {
        const element = document.createElement('ch-option-group');
        element.setAttribute('label', 'Group');
        element.innerHTML = Array.from(
          { length: 5 },
          (_, index) => `<ch-option value="${index}">Option ${index}</ch-option>`
        ).join('');
        return element;
      },
      update: (element, iteration) => {
        element.setAttribute('label', `Group ${iteration}`);
      },
    }));
});
