import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('calendar performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('calendar', 'ch-calendar'));
});
