import { expect, fixture, html } from '@open-wc/testing';
import { benchmarkComponentPerformance } from '../../internal/testing/component-performance.js';
import '../tag/index.js';
import './index.js';
import type { CoreTagGroup } from './tag-group.js';

const createGroup = (count: number, selection: CoreTagGroup['selection'] = 'none') => {
  const element = document.createElement('ch-tag-group') as CoreTagGroup;
  element.selection = selection;
  element.innerHTML = Array.from(
    { length: count },
    (_, index) => `<ch-tag removable value="${index}">Tag ${index}</ch-tag>`
  ).join('');
  return element;
};

describe('tag-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponentPerformance({
      name: 'tag-group',
      create: () => createGroup(5),
      update: (element, iteration) => {
        (element as CoreTagGroup).selection = iteration % 2 ? 'multiple' : 'none';
      },
    });

    await benchmarkComponentPerformance({
      name: 'tag-group/100-tags-arrow',
      create: () => createGroup(100, 'multiple'),
      update: element => {
        element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true, key: 'ArrowRight' }));
      },
    });
  });

  // Generous budget that only catches order-of-magnitude regressions (e.g. per-keystroke work that scales with tags).
  it('moves focus among 100 tags within budget', async () => {
    const budgetMs = 50;
    const element = await fixture<CoreTagGroup>(html`
      <ch-tag-group selection="multiple" label="Tags">
        ${Array.from({ length: 100 }, (_, index) => html`<ch-tag removable value=${index}>Tag ${index}</ch-tag>`)}
      </ch-tag-group>
    `);
    await element.updateComplete;
    element.focus();

    const samples: number[] = [];
    for (let iteration = 0; iteration < 23; iteration++) {
      const start = performance.now();
      element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true, key: 'ArrowRight' }));
      await element.updateComplete;
      if (iteration >= 3) samples.push(performance.now() - start);
    }

    const median = samples.sort((a, b) => a - b)[Math.floor(samples.length / 2)];
    expect(median).to.be.lessThan(budgetMs);
  });
});
