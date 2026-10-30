import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import { createScope } from '../../utilities/index.js';
import CoreSwitch from './switch.js';

createScope({ styles: [], components: [CoreSwitch] });

describe('switch performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkComponentPerformance({
      name: 'switch',
      create: () => document.createElement('ch-switch') as HTMLElement & { checked: boolean },
      update: element => {
        const control = element as HTMLElement & { checked: boolean };
        control.checked = !control.checked;
      },
    }));
});
