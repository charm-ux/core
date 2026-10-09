import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import { createScope } from '../../utilities/index.js';
import CoreRadio from '../radio/radio.js';
import coreRadioGroup from './radio-group.js';

createScope({
  styles: [],
  components: [coreRadioGroup, CoreRadio],
});

describe('radio-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponentPerformance({
      name: 'radio-group',
      create: () => {
        const element = document.createElement('ch-radio-group');
        element.innerHTML = Array.from(
          { length: 5 },
          (_, index) => `<ch-radio value="${index}">Option ${index}</ch-radio>`
        ).join('');
        return element;
      },
      update: (element, iteration) => element.setAttribute('value', String(iteration % 5)),
    });
  });
});
