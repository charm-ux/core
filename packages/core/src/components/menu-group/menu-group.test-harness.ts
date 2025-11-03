import { elementUpdated, expect, oneEvent } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import CoreMenuItem from '../menu-item/menu-item.js';
import type { CoreMenuGroup } from './index.js';

export class CoreMenuGroupTests<T extends CoreMenuGroup> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      menuGroup: {
        description: 'menuGroup',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              updateItemRolesDefault: {
                description: 'sets role="menuitem" when select is not set',
                test: async () => {
                  const el = this.component;
                  el.removeAttribute('select');

                  const menuItem1 = document.createElement('div');
                  const menuItem2 = document.createElement('div');

                  menuItem1.setAttribute('menu-item', '');
                  menuItem2.setAttribute('menu-item', '');

                  el.appendChild(menuItem1);
                  el.appendChild(menuItem2);

                  await elementUpdated(el);

                  expect(menuItem1.getAttribute('role')).to.equal('menuitem');
                  expect(menuItem2.getAttribute('role')).to.equal('menuitem');
                },
              },
              updateItemRoleSingle: {
                description: 'sets role="menuitemradio" when select is single',
                test: async () => {
                  const el = this.component;
                  el.select = 'single';

                  const menuItem1 = document.createElement('div');
                  const menuItem2 = document.createElement('div');

                  menuItem1.setAttribute('menu-item', '');
                  menuItem2.setAttribute('menu-item', '');

                  el.appendChild(menuItem1);
                  el.appendChild(menuItem2);

                  await elementUpdated(el);

                  expect(menuItem1.getAttribute('role')).to.equal('menuitemradio');
                  expect(menuItem2.getAttribute('role')).to.equal('menuitemradio');
                },
              },
              updateItemRolesMultiple: {
                description: 'sets role="menuitemcheckbox" when select is multiple',
                test: async () => {
                  const el = this.component;
                  el.select = 'multiple';

                  const menuItem1 = document.createElement('div');
                  const menuItem2 = document.createElement('div');

                  menuItem1.setAttribute('menu-item', '');
                  menuItem2.setAttribute('menu-item', '');

                  el.appendChild(menuItem1);
                  el.appendChild(menuItem2);

                  await elementUpdated(el);

                  expect(menuItem1.getAttribute('role')).to.equal('menuitemcheckbox');
                  expect(menuItem2.getAttribute('role')).to.equal('menuitemcheckbox');
                },
              },
            },
          },

          slots: {
            description: 'slots',
            tests: {
              defaultAndHeadingSlots: {
                description: 'provides default and heading slots',
                test: async () => {
                  const el = this.component;
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
                  expect(defaultSlot).to.exist;

                  const headingSlot = el.shadowRoot?.querySelector('slot[name="heading"]');
                  expect(headingSlot).to.exist;
                },
              },
            },
          },

          events: {
            description: 'events',
            tests: {
              handleSelectionEventEmission: {
                description: 'emits "menu-group-select" event with correct selectedItem when an item is selected',
                test: async () => {
                  const el = this.component;
                  el.select = 'single';

                  let menuItemTag = el.querySelector('[menu-item]')?.localName;

                  if (!menuItemTag) {
                    const prefix = el.localName.replace('menu-group', '');
                    menuItemTag = `${prefix}menu-item`;
                  }

                  const MenuItemClass = customElements.get(menuItemTag) as typeof CoreMenuItem;
                  if (!MenuItemClass) throw new Error(`MenuItemClass not found for tag: ${menuItemTag}`);

                  const menuItem1 = new MenuItemClass();
                  const menuItem2 = new MenuItemClass();

                  menuItem1.role = 'menuitemradio';
                  menuItem2.role = 'menuitemradio';

                  el.appendChild(menuItem1);
                  el.appendChild(menuItem2);

                  await elementUpdated(el);

                  const selectPromise = oneEvent(el, 'menu-group-select');

                  menuItem1.click();
                  await elementUpdated(el);

                  const event = await selectPromise;

                  expect(event.detail.selectedItem).to.equal(menuItem1);
                },
              },
            },
          },

          interactions: {
            description: 'interactions',
            tests: {
              handleSelectionSingle: {
                description: 'ensures only one menuitemradio has aria-checked="true" at a time',
                test: async () => {
                  const el = this.component;
                  el.select = 'single';

                  let menuItemTag = el.querySelector('[menu-item]')?.localName;

                  if (!menuItemTag) {
                    const prefix = el.localName.replace('menu-group', '');
                    menuItemTag = `${prefix}menu-item`;
                  }

                  const MenuItemClass = customElements.get(menuItemTag) as typeof CoreMenuItem;
                  if (!MenuItemClass) throw new Error(`MenuItemClass not found for tag: ${menuItemTag}`);

                  const menuItem1 = new MenuItemClass();
                  const menuItem2 = new MenuItemClass();

                  menuItem1.role = 'menuitemradio';
                  menuItem2.role = 'menuitemradio';

                  el.appendChild(menuItem1);
                  el.appendChild(menuItem2);

                  await elementUpdated(el);

                  menuItem1.click();
                  await elementUpdated(el);

                  expect(menuItem1.getAttribute('aria-checked')).to.equal('true');
                  expect(menuItem2.hasAttribute('aria-checked')).to.be.false;

                  menuItem2.click();
                  await elementUpdated(el);

                  expect(menuItem1.getAttribute('aria-checked')).to.equal('false');
                  expect(menuItem2.getAttribute('aria-checked')).to.equal('true');
                },
              },
            },
          },
        },
      },
    });
  }
}
