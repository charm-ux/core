import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('progress-bar performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkTagPerformance('progress-bar', 'ch-progress-bar'));
});
