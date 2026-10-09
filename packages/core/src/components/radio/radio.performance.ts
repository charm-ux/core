import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('radio performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('radio', 'ch-radio'));
});
