import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('switch performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('switch', 'ch-switch'));
});
