import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('date-range-picker performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkTagPerformance('date-range-picker', 'ch-date-range-picker'));
});
