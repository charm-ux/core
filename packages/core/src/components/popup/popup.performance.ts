import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('popup performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponentPerformance({
      name: 'popup',
      create: () => {
        const element = document.createElement('ch-popup');
        element.innerHTML = '<span slot="anchor">Anchor</span><div>Content</div>';
        return element;
      },
      update: (element, iteration) => element.setAttribute('distance', String(iteration % 2)),
    });
  });
});
