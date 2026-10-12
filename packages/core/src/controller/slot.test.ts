import { expect } from '@open-wc/testing';
import { HasSlotController } from './slot.js';
import type { CharmReactiveControllerHost } from '../base/types.js';

type TestHost = HTMLElement &
  CharmReactiveControllerHost & {
    addController: (controller: HasSlotController) => void;
    requestUpdate: () => void;
    updateCount: number;
  };

function createHost(): TestHost {
  const host = document.createElement('div') as unknown as TestHost;
  host.addController = () => undefined;
  host.updateCount = 0;
  host.requestUpdate = () => {
    host.updateCount += 1;
  };
  return host;
}

describe('HasSlotController', () => {
  it('caches the configured slot state before the first render', () => {
    const host = createHost();
    host.attachShadow({ mode: 'open' }).innerHTML = '<slot></slot><slot name="label"></slot>';
    host.append(document.createElement('span'));
    let queryCount = 0;
    const querySelector = host.querySelector.bind(host);
    host.querySelector = ((selector: string) => {
      queryCount += 1;
      return querySelector(selector);
    }) as typeof host.querySelector;
    const controller = new HasSlotController(host, '[default]', 'label');

    controller.hostConnected();

    expect(controller.hasDefaultSlot()).to.equal(true);
    expect(controller.hasNamedSlot('label')).to.equal(false);
    expect(queryCount).to.equal(1);

    controller.hasNamedSlot('label');
    expect(queryCount).to.equal(1);
  });

  it('uses slot names from the host constructor when none are passed', () => {
    const host = createHost();
    host.attachShadow({ mode: 'open' }).innerHTML = '<slot></slot><slot name="label"></slot>';
    Object.defineProperty(host, 'constructor', {
      value: { watchedSlots: ['[default]', 'label'] },
    });
    host.append(document.createElement('span'));
    const controller = new HasSlotController(host);

    controller.hostConnected();

    expect(controller.hasDefaultSlot()).to.equal(true);
    expect(controller.hasNamedSlot('label')).to.equal(false);
  });

  it('requests an update only when a watched slot changes', async () => {
    const host = createHost();
    host.attachShadow({ mode: 'open' }).innerHTML = '<slot></slot><slot name="label"></slot>';
    const controller = new HasSlotController(host, '[default]', 'label');
    controller.hostConnected();
    const slot = host.shadowRoot?.querySelector('slot');

    slot?.dispatchEvent(new Event('slotchange'));
    expect(host.updateCount).to.equal(0);

    host.append(document.createElement('span'));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(host.updateCount).to.equal(1);
    expect(controller.hasDefaultSlot()).to.equal(true);
  });

  it('rejects duplicate controllers for one host', () => {
    const host = createHost();
    new HasSlotController(host, '[default]');

    expect(() => new HasSlotController(host, '[default]')).to.throw('Only one HasSlotController');
  });
});
