import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { CharmScope, createScope } from '../../utilities/scope.js';
import accordionItem from '../../components/accordion-item/accordion-item.js';

describe('Scope', () => {
  it('errors on invalid suffix', async () => {
    const el = await fixture(html`<div id="my-app"></div>`);
    expect(() => {
      createScope({
        rootElement: el,
        suffix: '@#$%',
      });
    }).to.throw();
  });

  it('calling updateOptions multiple times preserves previous settings', async () => {
    const el = await fixture(html`<div id="my-app"></div>`);
    const scope = createScope({
      rootElement: el,
    });
    scope.updateOptions({
      suffix: 'suffix',
    });
    expect(scope.tagName('button')).to.equal('ch-button_suffix');
    scope.updateOptions({
      basePath: '/path',
    });
    expect(scope.tagName('button')).to.equal('ch-button_suffix');
  });

  it('should scope the internal element tag names when a "suffix" is set', async () => {
    const el = await fixture(html`<ch-accordion-item_suffix></ch-accordion-item_suffix>`);
    createScope({
      suffix: 'suffix',
      components: [accordionItem],
    });
    await elementUpdated(el);

    expect(el.shadowRoot?.querySelector('ch-icon_suffix')).to.not.be.null;
  });

  it('should re-register components after a prefix/suffix change when base is registered in a difference scope', () => {
    const scope1 = new CharmScope({
      suffix: 'scope1',
    });
    scope1.registerComponent(accordionItem);

    // simulates a separate harmony instance
    const scope2 = new CharmScope();
    scope2.registerComponent(accordionItem);

    scope2.updateOptions({
      suffix: 'scope2',
    });

    expect(customElements.get('ch-accordion-item_scope2')).to.not.be.undefined;
  });

  describe('getBaseName', () => {
    it('should remove the prefix and suffix from tag name', async () => {
      const el = await fixture(html`<div id="my-app"></div>`);
      const scope = createScope({
        rootElement: el,
        suffix: 'suffix',
      });

      const baseTagName = scope.getBaseName('ch-button_suffix');

      expect(baseTagName).to.equal('button');
    });
  });
});
