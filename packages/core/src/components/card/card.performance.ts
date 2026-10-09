import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('card performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('card', 'ch-card'));
});
