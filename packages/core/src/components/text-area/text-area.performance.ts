import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('text-area performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('text-area', 'ch-text-area'));
});
