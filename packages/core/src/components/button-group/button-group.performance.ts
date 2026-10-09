import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../internal/testing/component-performance.js';
import {
  composedComponentCases,
  composedPerformanceOptions,
} from '../../internal/testing/component-performance-cases.js';
import './index.js';
import '../button/index.js';

describe('button-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkTagPerformance('button-group', 'ch-button-group'));

  it('reports grouped button timings', () =>
    benchmarkComponentPerformance(composedComponentCases.buttonGroup, composedPerformanceOptions));
});
