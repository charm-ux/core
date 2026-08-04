import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { unsafeStatic } from 'lit/static-html.js';
import { createScope } from '../../../utilities/scope.js';
import icon from '../../../components/icon/icon.js';
import { project } from '../../../utilities/project.js';
import CharmElement from '../charm-element.js';

/** Test component that renders a nested Charm component through the scoped template tag. */
class ScopedTemplateHost extends CharmElement {
  public static override baseName = 'scoped-template-host';

  public static override get dependencies() {
    return [icon];
  }

  /** Exposes the transformed strings array so the caching behavior can be asserted directly. */
  public renderTemplate(label: string) {
    return this.html`<scoped-icon name="check"></scoped-icon><span>${label}</span>`;
  }

  protected override render() {
    return this.renderTemplate('hello');
  }
}

project.scope.registerComponent(ScopedTemplateHost);

class ScopedTemplateWithDynamicTag extends CharmElement {
  public static override baseName = 'scoped-template-dynamic-host';

  public static override get dependencies() {
    return [icon];
  }

  protected override render() {
    const tag = unsafeStatic('span');
    return this.html`<${tag}><scoped-icon name="check"></scoped-icon><span>Hello</span></${tag}>`;
  }
}

project.scope.registerComponent(ScopedTemplateWithDynamicTag);

describe('CharmElement scoped template tag', () => {
  it('rewrites <scoped-*> tags to the scope tag name', async () => {
    const el = await fixture<ScopedTemplateHost>(html`<ch-scoped-template-host></ch-scoped-template-host>`);
    await elementUpdated(el);

    expect(el.shadowRoot?.querySelector('ch-icon')).to.not.be.null;
    expect(el.shadowRoot?.querySelector('scoped-icon')).to.be.null;
  });

  it('leaves non-scoped tags and interpolated values alone', async () => {
    const el = await fixture<ScopedTemplateHost>(html`<ch-scoped-template-host></ch-scoped-template-host>`);
    await elementUpdated(el);

    expect(el.shadowRoot?.querySelector('span')?.textContent).to.equal('hello');
  });

  it('includes the scope suffix, not just the prefix', async () => {
    createScope({ suffix: 'sfx', components: [ScopedTemplateHost, icon] });

    const el = await fixture<ScopedTemplateHost>(html`<ch-scoped-template-host_sfx></ch-scoped-template-host_sfx>`);
    await elementUpdated(el);

    expect(el.shadowRoot?.querySelector('ch-icon_sfx')).to.not.be.null;
    expect(el.shadowRoot?.querySelector('ch-icon')).to.be.null;
  });

  it('supports dynamic tag names alongside scoped tag rewrites', async () => {
    const el = await fixture<ScopedTemplateWithDynamicTag>(
      html`<ch-scoped-template-dynamic-host></ch-scoped-template-dynamic-host>`
    );
    await elementUpdated(el);

    expect(el.shadowRoot?.querySelector('span')).to.not.be.null;
    expect(el.shadowRoot?.querySelector('ch-icon')).to.not.be.null;
    expect(el.shadowRoot?.querySelector('scoped-icon')).to.be.null;
  });

  it('returns a stable strings array per call site so Lit can reuse its compiled template', async () => {
    const el = await fixture<ScopedTemplateHost>(html`<ch-scoped-template-host></ch-scoped-template-host>`);
    await elementUpdated(el);

    const first = el.renderTemplate('a');
    const second = el.renderTemplate('b');

    expect(first.strings).to.equal(second.strings);
    expect(first.strings).to.have.own.property('raw');
    expect(first.values).to.deep.equal(['a']);
    expect(second.values).to.deep.equal(['b']);
  });

  it('caches separately per scope', async () => {
    const defaultEl = await fixture<ScopedTemplateHost>(html`<ch-scoped-template-host></ch-scoped-template-host>`);
    await elementUpdated(defaultEl);

    createScope({ suffix: 'sfx2', components: [ScopedTemplateHost, icon] });
    const suffixedEl = await fixture<ScopedTemplateHost>(
      html`<ch-scoped-template-host_sfx2></ch-scoped-template-host_sfx2>`
    );
    await elementUpdated(suffixedEl);

    expect(defaultEl.renderTemplate('x').strings).to.not.equal(suffixedEl.renderTemplate('x').strings);
  });
});
