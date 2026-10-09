import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('alert performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('alert', 'ch-alert'));
});
