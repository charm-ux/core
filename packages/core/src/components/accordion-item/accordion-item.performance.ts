import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('accordion-item performance', () => {
  it('reports mount, rerender, and bulk mount timings', () =>
    benchmarkTagPerformance('accordion-item', 'ch-accordion-item'));
});
