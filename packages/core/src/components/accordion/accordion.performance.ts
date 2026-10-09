import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../internal/testing/component-performance.js';
import {
  composedComponentCases,
  composedPerformanceOptions,
} from '../../internal/testing/component-performance-cases.js';
import './index.js';
import '../accordion-item/index.js';

describe('accordion performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('accordion', 'ch-accordion'));

  it('reports composed accordion timings', () =>
    benchmarkComponentPerformance(composedComponentCases.accordion, composedPerformanceOptions));
});
