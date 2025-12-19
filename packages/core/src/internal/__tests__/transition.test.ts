import { expect, fixture, html } from '@open-wc/testing';
import detectTransitionFromStyles from '../transition.js';

describe('detectTransitionFromStyles', () => {
  it('detects a single property transition', async () => {
    const el = await fixture(html`<div></div>`);
    const info = await detectTransitionFromStyles(el, 'opacity 0.2s');
    expect(info.transition).to.be.true;
    expect(info.transitionProperty).to.equal('opacity');
  });

  it('detects the property with the longest duration (ms and s units)', async () => {
    const el = await fixture(html`<div></div>`);
    // opacity 0.1s (100ms) and transform 200ms -> transform has the longest duration
    const info = await detectTransitionFromStyles(el, 'opacity 0.1s, transform 200ms');
    expect(info.transition).to.be.true;
    expect(info.transitionProperty).to.equal('transform');
  });

  it('returns no transition for "none"', async () => {
    const el = await fixture(html`<div></div>`);
    const info = await detectTransitionFromStyles(el, 'none');
    expect(info.transition).to.be.false;
    expect(info.transitionProperty).to.be.undefined;
  });
});
