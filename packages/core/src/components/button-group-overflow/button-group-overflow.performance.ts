import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('button-group-overflow performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkTagPerformance('button-group-overflow', 'ch-button-group-overflow'));
});
