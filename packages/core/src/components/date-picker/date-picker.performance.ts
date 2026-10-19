import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('date-picker performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('date-picker', 'ch-date-picker'));
});
