import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { DEFAULT_THEME_PREFIX, setThemePrefix } from '../../../utilities/theme.js';
import accordionItem from '../../../components/accordion-item/accordion-item.js';
import { project } from '../../../utilities/project.js';

project.scope.registerComponent(accordionItem);

/** Concatenated text of every stylesheet adopted by the element's shadow root. */
function adoptedCss(el: Element): string {
  const sheets = el.shadowRoot?.adoptedStyleSheets ?? [];
  return sheets.flatMap(sheet => Array.from(sheet.cssRules, rule => rule.cssText)).join('\n');
}

describe('CharmElement theme prefix transformation', () => {
  afterEach(() => {
    setThemePrefix(DEFAULT_THEME_PREFIX);
  });

  it('leaves styles untouched on the default prefix', async () => {
    const el = await fixture(html`<ch-accordion-item></ch-accordion-item>`);
    await elementUpdated(el);

    expect(adoptedCss(el)).to.contain('--charm-');
  });

  it('rewrites baked custom-property names to the configured prefix', async () => {
    setThemePrefix('fui');

    const el = await fixture(html`<ch-accordion-item></ch-accordion-item>`);
    await elementUpdated(el);

    const css = adoptedCss(el);
    expect(css).to.contain('--fui-');
    expect(css).to.not.contain('--charm-');
  });

  it('reuses the same stylesheets across instances of a component at a given prefix', async () => {
    setThemePrefix('fui');

    const first = await fixture(html`<ch-accordion-item></ch-accordion-item>`);
    const second = await fixture(html`<ch-accordion-item></ch-accordion-item>`);
    await elementUpdated(first);
    await elementUpdated(second);

    const firstSheets = first.shadowRoot!.adoptedStyleSheets;
    const secondSheets = second.shadowRoot!.adoptedStyleSheets;

    expect(firstSheets.length).to.be.greaterThan(0);
    expect(firstSheets.length).to.equal(secondSheets.length);
    firstSheets.forEach((sheet, i) => expect(sheet).to.equal(secondSheets[i]));
  });

  it('caches separately per prefix', async () => {
    setThemePrefix('fui');
    const fuiEl = await fixture(html`<ch-accordion-item></ch-accordion-item>`);
    await elementUpdated(fuiEl);

    setThemePrefix('pbz');
    const pbzEl = await fixture(html`<ch-accordion-item></ch-accordion-item>`);
    await elementUpdated(pbzEl);

    expect(fuiEl.shadowRoot!.adoptedStyleSheets[0]).to.not.equal(pbzEl.shadowRoot!.adoptedStyleSheets[0]);
    expect(adoptedCss(fuiEl)).to.contain('--fui-');
    expect(adoptedCss(pbzEl)).to.contain('--pbz-');
  });

  it('rewrites the base class styles inherited from CharmElement, not just component styles', async () => {
    setThemePrefix('fui');

    const el = await fixture(html`<ch-accordion-item></ch-accordion-item>`);
    await elementUpdated(el);

    // `elementStyles` is [charm-element.styles, accordion-item.styles]; every entry gets a sheet.
    expect(el.shadowRoot!.adoptedStyleSheets.length).to.be.greaterThan(1);
  });
});
