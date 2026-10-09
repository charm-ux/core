import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import { createScope } from '../../utilities/index.js';
import coreInput from './input.js';

createScope({
  components: [coreInput],
});

describe('input performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponentPerformance({
      name: 'input',
      create: () => {
        const element = document.createElement('ch-input');
        element.setAttribute('label', 'Label');
        return element;
      },
      update: (element, iteration) => element.setAttribute('value', `value-${iteration}`),
    });
  });
});
