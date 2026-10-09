import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('tab-panel performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('tab-panel', 'ch-tab-panel'));
});
