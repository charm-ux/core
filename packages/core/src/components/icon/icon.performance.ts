import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('icon performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('icon', 'ch-icon'));
});
