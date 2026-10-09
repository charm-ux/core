import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('tab performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('tab', 'ch-tab'));
});
