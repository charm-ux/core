import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmScope, createScope, getScope, setProjectConfig } from '../../utilities/scope.js';
import accordionItem from '../../components/accordion-item/accordion-item.js';

describe('Scope', () => {
  afterEach(() => setProjectConfig({}));

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

  it('creates independent scope instances and does not mistake names beginning with the prefix', () => {
    const first = createScope({ suffix: 'independent1' });
    const second = createScope({ suffix: 'independent2' });

    expect(first).to.not.equal(second);
    expect(second.tagName('checkbox')).to.equal('ch-checkbox_independent2');
    expect(second.tagName('chip')).to.equal('ch-chip_independent2');
  });

  it('preserves the root element when updateOptions is called without one', async () => {
    const root = await fixture(html`<div id="scope-root"></div>`);
    const scope = createScope({ rootElement: root });

    scope.updateOptions();

    expect(scope.rootElement).to.equal(root);
  });

  it('rejects a prefix change after registering a component', () => {
    setProjectConfig({ prefix: 'testscope' });
    const scope = new CharmScope({ suffix: 'prefixcheck' });
    scope.registerComponent(accordionItem);

    setProjectConfig({ prefix: 'otherprefix' });
    expect(() => scope.updateOptions()).to.throw('Cannot change the custom-element prefix');
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

  it('re-registers a component on suffix change when another scope already owns its tag', () => {
    class TrackedItem extends accordionItem {
      public static override baseName = 'scope-tracked';
    }
    new CharmScope().registerComponent(TrackedItem);

    const scope = new CharmScope();
    scope.registerComponent(TrackedItem);
    scope.updateOptions({ suffix: 'tracked' });

    expect(customElements.get('ch-scope-tracked_tracked')).to.not.be.undefined;
  });

  it('warns and skips a tag already defined outside a Charm scope', () => {
    customElements.define('ch-scope-external', class extends HTMLElement {});
    class ExternalItem extends accordionItem {
      public static override baseName = 'scope-external';
    }
    const warn = sinon.stub(console, 'warn');

    try {
      expect(() => new CharmScope().registerComponent(ExternalItem)).to.not.throw();
      expect(warn.calledOnce).to.be.true;
      expect(getScope('ch-scope-external')).to.be.undefined;
    } finally {
      warn.restore();
    }
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
