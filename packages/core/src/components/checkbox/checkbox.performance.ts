import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('checkbox performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('checkbox', 'ch-checkbox'));
});
