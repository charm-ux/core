import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import { createScope } from '../../utilities/index.js';
import CoreCheckbox from './checkbox.js';

createScope({ styles: [], components: [CoreCheckbox] });

describe('checkbox performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkComponentPerformance({
      name: 'checkbox',
      create: () => document.createElement('ch-checkbox') as HTMLElement & { checked: boolean },
      update: element => {
        const checkbox = element as HTMLElement & { checked: boolean };
        checkbox.checked = !checkbox.checked;
      },
    }));
});
