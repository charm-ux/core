import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('scoped-styles performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkTagPerformance('scoped-styles', 'ch-scoped-styles'));
});
