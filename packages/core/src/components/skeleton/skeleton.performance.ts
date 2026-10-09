import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('skeleton performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('skeleton', 'ch-skeleton'));
});
