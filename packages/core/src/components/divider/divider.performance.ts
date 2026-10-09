import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('divider performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('divider', 'ch-divider'));
});
