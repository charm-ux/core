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
        (element as InstanceType<typeof coreCheckboxGroup>).value = [String(iteration % 5)];
      },
    });
  });
});
