import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('tooltip performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('tooltip', 'ch-tooltip'));
});
