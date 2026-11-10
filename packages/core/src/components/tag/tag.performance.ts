import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('tag performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('tag', 'ch-tag'));
});
