import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../internal/testing/component-performance.js';
import {
  composedComponentCases,
  composedPerformanceOptions,
} from '../../internal/testing/component-performance-cases.js';
import './index.js';
import '../menu-item/index.js';

describe('menu performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('menu', 'ch-menu'));

  it('reports composed menu timings', () =>
    benchmarkComponentPerformance(composedComponentCases.menu, composedPerformanceOptions));
});
