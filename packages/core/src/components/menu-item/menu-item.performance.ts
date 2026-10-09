import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../internal/testing/component-performance.js';
import {
  composedComponentCases,
  composedPerformanceOptions,
} from '../../internal/testing/component-performance-cases.js';
import './index.js';

describe('menu-item performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('menu-item', 'ch-menu-item'));

  it('reports submenu timings', () =>
    benchmarkComponentPerformance(composedComponentCases.menuItem, composedPerformanceOptions));
});
