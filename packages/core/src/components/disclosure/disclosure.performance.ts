import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('disclosure performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('disclosure', 'ch-disclosure'));
});
