import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../internal/testing/component-performance.js';
import {
  composedComponentCases,
  composedPerformanceOptions,
} from '../../internal/testing/component-performance-cases.js';
import './index.js';
import '../breadcrumb-item/index.js';

describe('breadcrumb performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('breadcrumb', 'ch-breadcrumb'));

  it('reports composed breadcrumb timings', () =>
    benchmarkComponentPerformance(composedComponentCases.breadcrumb, composedPerformanceOptions));
});
