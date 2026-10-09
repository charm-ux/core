import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('badge performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('badge', 'ch-badge'));
});
