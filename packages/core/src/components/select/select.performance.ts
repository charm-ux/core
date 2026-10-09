import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../internal/testing/component-performance.js';
import {
  composedComponentCases,
  composedPerformanceOptions,
} from '../../internal/testing/component-performance-cases.js';
import './index.js';

describe('select performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('select', 'ch-select'));

  it('reports option list timings', () =>
    benchmarkComponentPerformance(composedComponentCases.select, composedPerformanceOptions));
});
