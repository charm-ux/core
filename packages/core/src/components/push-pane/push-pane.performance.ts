import { benchmarkTagPerformance } from '../../internal/testing/component-performance.js';
import './index.js';

describe('push-pane performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTagPerformance('push-pane', 'ch-push-pane'));
});
