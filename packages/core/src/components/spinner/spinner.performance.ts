import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('spinner performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('spinner', 'ch-spinner'));
});
