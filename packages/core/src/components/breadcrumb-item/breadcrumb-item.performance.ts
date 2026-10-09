import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('breadcrumb-item performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkTagPerformance('breadcrumb-item', 'ch-breadcrumb-item'));
});
