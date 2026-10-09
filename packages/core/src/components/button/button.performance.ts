import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import { createScope } from '../../utilities/index.js';
import coreButton from './button.js';

createScope({
  styles: [],
  components: [coreButton],
});

describe('core-button performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponentPerformance({
      name: 'button',
      create: () => {
        const element = document.createElement('ch-button');
        element.textContent = 'Button';
        return element;
      },
      update: (element, iteration) => element.setAttribute('disabled', String(iteration % 2 === 0)),
    });
  });
});
