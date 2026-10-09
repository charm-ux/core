import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../internal/testing/component-performance.js';
import {
  composedComponentCases,
  composedPerformanceOptions,
} from '../../internal/testing/component-performance-cases.js';
import './index.js';

describe('dialog performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('dialog', 'ch-dialog'));

  it('reports dialog with slotted content timings', () =>
    benchmarkComponentPerformance(composedComponentCases.dialog, composedPerformanceOptions));
});
