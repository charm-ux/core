import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('overflow performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponentPerformance({
      name: 'overflow',
      create: () => {
        const element = document.createElement('ch-overflow');
        element.setAttribute('menu-position', 'none');
        element.innerHTML = '<button>One</button><button>Two</button><button>Three</button>';
        return element;
      },
      update: (element, iteration) => element.setAttribute('label', `More ${iteration}`),
    });
  });
});
