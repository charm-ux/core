import { elementUpdated, expect } from '@open-wc/testing';
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
  parseTimeToMilliseconds: (value: string) => number;
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

  it('parses none, comma-separated transitions, units, delays, and bare seconds', async () => {
    const element = await mount('ch-alert');
    const getMaxTransitionTime = (element as unknown as DismissibleInternals).getMaxTransitionTime;

    expect(getMaxTransitionTime.call(element, ['none'])).to.equal(0);
    expect(getMaxTransitionTime.call(element, ['opacity 0.2s 50ms, transform 300ms 0.1s'])).to.equal(400);
    expect((element as unknown as DismissibleInternals).parseTimeToMilliseconds('2')).to.equal(2000);
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
