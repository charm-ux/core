import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../internal/testing/component-performance.js';
import {
  composedComponentCases,
  composedPerformanceOptions,
} from '../../internal/testing/component-performance-cases.js';
import './index.js';

describe('menu-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('menu-group', 'ch-menu-group'));

  it('reports grouped menu item timings', () =>
    benchmarkComponentPerformance(composedComponentCases.menuGroup, composedPerformanceOptions));
});
