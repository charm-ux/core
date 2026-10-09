import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import { createScope } from '../../utilities/index.js';
import CoreTab from '../tab/tab.js';
import CoreTabPanel from '../tab-panel/tab-panel.js';
import CoreTabs from './tabs.js';

createScope({
  styles: [],
  components: [CoreTabs, CoreTab, CoreTabPanel],
});

describe('tabs performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponentPerformance({
      name: 'tabs',
      create: () => {
        const element = document.createElement('ch-tabs');
        element.innerHTML =
          '<ch-tab id="tab-one">One</ch-tab><ch-tab id="tab-two">Two</ch-tab>' +
          '<ch-tab-panel>Panel one</ch-tab-panel><ch-tab-panel>Panel two</ch-tab-panel>';
        return element;
      },
      update: (element, iteration) => element.setAttribute('active-id', iteration % 2 === 0 ? 'tab-one' : 'tab-two'),
    });
  });
});
