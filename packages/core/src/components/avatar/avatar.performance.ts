import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('avatar performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('avatar', 'ch-avatar'));
});
