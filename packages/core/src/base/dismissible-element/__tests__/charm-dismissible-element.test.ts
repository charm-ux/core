import { elementUpdated, expect, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import { DEFAULT_THEME_PREFIX, setThemePrefix } from '../../../utilities/theme.js';
import '../../../components/accordion-item/index.js';
import '../../../components/alert/index.js';
import '../../../components/dialog/index.js';
import '../../../components/disclosure/index.js';
import '../../../components/menu/index.js';
import '../../../components/popup/index.js';
import '../../../components/push-pane/index.js';
import '../../../components/tooltip/index.js';

type DismissibleInternals = {
  getMaxTransitionTime: (styles: string[]) => number;
  getTransitionStyles: () => string[];
};

const tags = [
  'ch-accordion-item',
  'ch-alert',
  'ch-dialog',
  'ch-disclosure',
  'ch-menu',
  'ch-popup',
  'ch-push-pane',
  'ch-tooltip',
];

async function mount(tag: string, style = ''): Promise<HTMLElement> {
  const element = document.createElement(tag);
  if (style) element.setAttribute('style', style);
  document.body.append(element);
  await elementUpdated(element as never);
  return element;
}

describe('CharmDismissibleElement', () => {
  afterEach(() => {
    setThemePrefix(DEFAULT_THEME_PREFIX);
    document.body.replaceChildren();
  });

  it('does not recalculate styles when dismissible subclasses connect', async () => {
    const getComputedStyle = sinon.spy(window, 'getComputedStyle');

    for (const tag of tags) {
      const element = await mount(tag);
      expect(getComputedStyle).not.to.have.been.called;
      element.remove();
    }

    getComputedStyle.restore();
  });

  it('inspects only prefixed, unprefixed, and variant transition tokens', async () => {
    setThemePrefix('fui');
    const element = await mount(
      'ch-alert',
      '--fui-alert-show-transition: opacity 1ms; --charm-alert-transition: none; --unrelated: opacity 10s;'
    );
    const internals = element as unknown as DismissibleInternals;

    expect(internals.getTransitionStyles()).to.deep.equal(['opacity 1ms']);

    element.style.setProperty('--alert-hide-transition', 'opacity 2ms 3ms');
    expect(internals.getTransitionStyles()).to.deep.equal(['opacity 2ms 3ms', 'opacity 1ms']);
  });

  it('parses none, comma-separated transitions, units, and delays', async () => {
    const element = await mount('ch-alert');
    const getMaxTransitionTime = (element as unknown as DismissibleInternals).getMaxTransitionTime;

    expect(getMaxTransitionTime.call(element, ['none'])).to.equal(0);
    expect(getMaxTransitionTime.call(element, ['opacity 0.2s 50ms, transform 300ms 0.1s'])).to.equal(400);
  });

  it('waits for the initial render before emitting after-show for an initially open component', async () => {
    const element = document.createElement('ch-alert');
    element.setAttribute('open', '');
    const afterShow = oneEvent(element, 'alert-after-show');
    document.body.append(element);

    await afterShow;
    expect(element.hasAttribute('open')).to.be.true;
    expect(element.shadowRoot?.querySelector('.alert-wrapper')).to.not.be.null;
  });

  it('does not settle on a shorter or pseudo-element transition end', async () => {
    const element = await mount('ch-alert', '--alert-transition: opacity 100ms, transform 500ms;');
    const internals = element as unknown as {
      open: boolean;
      handleTransitionEnd: (event: TransitionEvent) => void;
      pendingAfterEvent?: string;
    };
    internals.open = true;
    const event = (elapsedTime: number, pseudoElement = '') =>
      ({ target: element, currentTarget: element, elapsedTime, pseudoElement }) as unknown as TransitionEvent;

    internals.handleTransitionEnd(event(0.1));
    expect(internals.pendingAfterEvent).to.equal('after-show');
    internals.handleTransitionEnd(event(0.5, '::before'));
    expect(internals.pendingAfterEvent).to.equal('after-show');
    element.remove();
  });

  it('restarts a pending after event after reconnecting during a transition', async () => {
    const element = await mount('ch-alert', '--alert-transition: opacity 1ms;');
    const afterShow = oneEvent(element, 'alert-after-show');
    (element as HTMLElement & { open: boolean }).open = true;
    element.remove();
    document.body.append(element);

    await afterShow;
    expect((element as HTMLElement & { open: boolean }).open).to.be.true;
  });

  it('keeps the closed state when a show listener immediately hides the element', async () => {
    const element = await mount('ch-alert');
    const afterHide = oneEvent(element, 'alert-after-hide');
    element.addEventListener('alert-show', () => ((element as HTMLElement & { open: boolean }).open = false), {
      once: true,
    });
    (element as HTMLElement & { open: boolean }).open = true;

    await afterHide;
    expect((element as HTMLElement & { open: boolean }).open).to.be.false;
  });

  it('measures starts-open elements after firstUpdated and reacts to theme changes', async () => {
    setThemePrefix('fui');
    const element = await mount('ch-alert', '--fui-alert-transition: opacity 1ms; --charm-alert-transition: none;');
    element.setAttribute('open', '');
    await elementUpdated(element as never);

    const internals = element as unknown as DismissibleInternals;
    expect(internals.getTransitionStyles()).to.deep.equal(['opacity 1ms']);

    setThemePrefix('acme');
    element.style.setProperty('--acme-alert-transition', 'opacity 2ms');
    expect(internals.getTransitionStyles()).to.deep.equal(['opacity 2ms']);
  });
});
