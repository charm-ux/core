import { aTimeout, elementUpdated, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreTag } from '../tag/index.js';
import type { CoreTagGroup } from './index.js';

export class CoreTagGroupTests<T extends CoreTagGroup> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      tagGroup: {
        description: 'tag group',
        tests: {
          semantics: {
            description: 'semantics',
            tests: {
              listRoles: {
                description: 'exposes a list of list items when selection is none',
                test: async () => {
                  const group = this.component;
                  await this.ready();
                  const list = this.list();
                  expect(list.getAttribute('role')).to.equal('list');
                  expect(list.hasAttribute('aria-multiselectable')).to.be.false;
                  expect(list.hasAttribute('aria-orientation')).to.be.false;
                  expect(this.tags().map(tag => tag.getAttribute('role'))).to.deep.equal([
                    'listitem',
                    'listitem',
                    'listitem',
                  ]);
                  expect(this.tags().every(tag => !tag.hasAttribute('aria-selected'))).to.be.true;
                  await expect(group).to.be.accessible();
                },
              },
              listboxRoles: {
                description: 'exposes a listbox of options when selection is enabled',
                test: async () => {
                  const group = this.component;
                  group.selection = 'multiple';
                  await elementUpdated(group);
                  const list = this.list();
                  expect(list.getAttribute('role')).to.equal('listbox');
                  expect(list.getAttribute('aria-multiselectable')).to.equal('true');
                  expect(list.getAttribute('aria-orientation')).to.equal('horizontal');
                  expect(this.tags().map(tag => tag.getAttribute('role'))).to.deep.equal([
                    'option',
                    'option',
                    'option',
                  ]);
                  expect(this.tags().map(tag => tag.getAttribute('aria-selected'))).to.deep.equal([
                    'false',
                    'false',
                    'false',
                  ]);
                  await expect(group).to.be.accessible();

                  group.selection = 'single';
                  await elementUpdated(group);
                  expect(this.list().hasAttribute('aria-multiselectable')).to.be.false;
                },
              },
              labelAndDescription: {
                description: 'names and describes the list from the label and help-text in the same tree scope',
                test: async () => {
                  const group = this.component;
                  group.helpText = 'Pick a few';
                  await elementUpdated(group);
                  const list = this.list();
                  expect(list.getAttribute('aria-labelledby')).to.equal('label');
                  expect(list.getAttribute('aria-describedby')).to.equal('help-text');
                  expect(group.shadowRoot?.getElementById('label')?.textContent?.trim()).to.equal('Fruit');
                  expect(group.shadowRoot?.getElementById('help-text')?.textContent?.trim()).to.equal('Pick a few');
                  expect(list.hasAttribute('aria-label')).to.be.false;

                  group.removeAttribute('label');
                  group.helpText = undefined;
                  await elementUpdated(group);
                  expect(this.list().hasAttribute('aria-labelledby')).to.be.false;
                  expect(this.list().hasAttribute('aria-describedby')).to.be.false;
                },
              },
              slottedLabel: {
                description: 'uses slotted label content',
                test: async () => {
                  const group = this.component;
                  group.removeAttribute('label');
                  const label = document.createElement('span');
                  label.slot = 'label';
                  label.textContent = 'Toppings';
                  group.append(label);
                  await aTimeout(0);
                  await elementUpdated(group);
                  expect(this.list().getAttribute('aria-labelledby')).to.equal('label');
                  const slot = group.shadowRoot?.querySelector('slot[name="label"]') as HTMLSlotElement;
                  expect(slot.assignedElements()).to.deep.equal([label]);
                },
              },
              emptyState: {
                description: 'shows the empty slot and hides the list when there are no tags',
                test: async () => {
                  const group = this.component;
                  const empty = document.createElement('span');
                  empty.slot = 'empty';
                  empty.textContent = 'No tags';
                  group.append(empty);
                  this.tags().forEach(tag => tag.remove());
                  await aTimeout(0);
                  await elementUpdated(group);
                  expect(this.list().hidden).to.be.true;
                  expect((group.shadowRoot?.querySelector('[part="tag-group-empty"]') as HTMLElement).hidden).to.be
                    .false;
                },
              },
              restoresTagOnRemoval: {
                description: 'restores a tag to its standalone state when it leaves the group',
                test: async () => {
                  const group = this.component;
                  await this.ready();
                  const [tag] = this.tags();
                  tag.remove();
                  await aTimeout(0);
                  await elementUpdated(group);
                  expect(tag.hasAttribute('role')).to.be.false;
                  expect(tag.hasAttribute('tabindex')).to.be.false;
                  expect(tag.managedFocus).to.be.false;
                  expect(tag.forceDisabled).to.be.false;
                },
              },
            },
          },
          focus: {
            description: 'focus management',
            tests: {
              rovingTabindex: {
                description: 'gives the first enabled tag the only tab stop and removes the remove buttons from it',
                test: async () => {
                  await this.ready();
                  const tags = this.tags();
                  expect(tags.map(tag => tag.tabIndex)).to.deep.equal([0, -1, -1]);
                  expect(tags.every(tag => tag.managedFocus)).to.be.true;
                  await waitUntil(() =>
                    tags.every(tag => tag.shadowRoot?.querySelector('[part="tag-remove"]')?.getAttribute('tabindex'))
                  );
                  expect(
                    tags.map(tag => tag.shadowRoot?.querySelector('[part="tag-remove"]')?.getAttribute('tabindex'))
                  ).to.deep.equal(['-1', '-1', '-1']);
                },
              },
              presentationalRemoveInListbox: {
                description: 'swaps the remove button for a pointer-only control while tags are listbox options',
                test: async () => {
                  const group = this.component;
                  group.selection = 'multiple';
                  await elementUpdated(group);
                  const tags = this.tags();
                  await waitUntil(() => tags.every(tag => tag.presentationalRemove));
                  await Promise.all(tags.map(tag => tag.updateComplete));
                  expect(tags.every(tag => tag.shadowRoot?.querySelector('button') === null)).to.be.true;
                  expect(
                    tags.every(tag => tag.shadowRoot?.querySelector('[part="tag-remove"]')?.getAttribute('aria-hidden'))
                  ).to.be.true;

                  group.selection = 'none';
                  await elementUpdated(group);
                  await waitUntil(() => tags.every(tag => !tag.presentationalRemove));
                  await Promise.all(tags.map(tag => tag.updateComplete));
                  expect(tags.every(tag => tag.shadowRoot?.querySelector('button') !== null)).to.be.true;
                },
              },
              skipsDisabledTabStop: {
                description: 'moves the tab stop to the first enabled tag when the first is disabled',
                test: async () => {
                  const group = this.component;
                  const tags = this.tags();
                  tags[0].disabled = true;
                  await elementUpdated(tags[0]);
                  group.focus();
                  expect(document.activeElement).to.equal(tags[1]);
                  expect(tags.map(tag => tag.tabIndex)).to.deep.equal([-1, 0, -1]);
                },
              },
              arrowNavigation: {
                description: 'moves focus with the arrow keys, skipping disabled tags, without wrapping',
                test: async () => {
                  const group = this.component;
                  const tags = this.tags();
                  tags[1].disabled = true;
                  await elementUpdated(tags[1]);
                  group.focus();
                  await sendKeys({ press: 'ArrowRight' });
                  expect(document.activeElement).to.equal(tags[2]);
                  await sendKeys({ press: 'ArrowRight' });
                  expect(document.activeElement, 'does not wrap').to.equal(tags[2]);
                  await sendKeys({ press: 'ArrowLeft' });
                  expect(document.activeElement).to.equal(tags[0]);
                  await sendKeys({ press: 'ArrowDown' });
                  expect(document.activeElement).to.equal(tags[2]);
                  expect(tags.map(tag => tag.tabIndex)).to.deep.equal([-1, -1, 0]);
                },
              },
              homeEnd: {
                description: 'Home and End move to the first and last enabled tags',
                test: async () => {
                  const group = this.component;
                  const tags = this.tags();
                  group.focus();
                  await sendKeys({ press: 'End' });
                  expect(document.activeElement).to.equal(tags[2]);
                  await sendKeys({ press: 'Home' });
                  expect(document.activeElement).to.equal(tags[0]);
                },
              },
              rtlArrows: {
                description: 'reverses the horizontal arrow keys in RTL',
                test: async () => {
                  const group = this.component;
                  const tags = this.tags();
                  group.setAttribute('dir', 'rtl');
                  await elementUpdated(group);
                  group.focus();
                  await sendKeys({ press: 'ArrowLeft' });
                  expect(document.activeElement).to.equal(tags[1]);
                  await sendKeys({ press: 'ArrowRight' });
                  expect(document.activeElement).to.equal(tags[0]);
                },
              },
              typeahead: {
                description: 'typing a character moves focus to the next tag starting with it',
                test: async () => {
                  const group = this.component;
                  const tags = this.tags();
                  group.focus();
                  await sendKeys({ type: 'c' });
                  expect(document.activeElement).to.equal(tags[2]);
                  await sendKeys({ type: 'b' });
                  expect(document.activeElement).to.equal(tags[1]);
                },
              },
              clickSyncsTabStop: {
                description: 'clicking a tag makes it the tab stop',
                test: async () => {
                  await this.ready();
                  const tags = this.tags();
                  tags[2].click();
                  await elementUpdated(this.component);
                  expect(tags.map(tag => tag.tabIndex)).to.deep.equal([-1, -1, 0]);
                },
              },
              focusAfterRemoval: {
                description:
                  'moves focus to the next tag after the focused tag is removed, or the previous one at the end',
                test: async () => {
                  const group = this.component;
                  const tags = this.tags();
                  group.addEventListener('tag-remove', event => (event.target as HTMLElement).remove());
                  group.focus();
                  await sendKeys({ press: 'ArrowRight' });
                  expect(document.activeElement).to.equal(tags[1]);
                  await sendKeys({ press: 'Delete' });
                  await waitUntil(() => !tags[1].isConnected);
                  await elementUpdated(group);
                  expect(document.activeElement, 'next tag takes focus').to.equal(tags[2]);
                  await sendKeys({ press: 'Delete' });
                  await waitUntil(() => !tags[2].isConnected);
                  await elementUpdated(group);
                  expect(document.activeElement, 'previous tag takes focus at the end').to.equal(tags[0]);
                },
              },
              disabledGroup: {
                description: 'disabled group force-disables its tags and removes every tab stop',
                test: async () => {
                  const group = this.component;
                  group.disabled = true;
                  await elementUpdated(group);
                  const tags = this.tags();
                  await waitUntil(() => tags.every(tag => tag.getAttribute('aria-disabled') === 'true'));
                  expect(tags.every(tag => tag.forceDisabled && !tag.disabled)).to.be.true;
                  expect(tags.map(tag => tag.tabIndex)).to.deep.equal([-1, -1, -1]);
                  expect(this.list().getAttribute('aria-disabled')).to.equal('true');

                  group.disabled = false;
                  await elementUpdated(group);
                  await waitUntil(() => tags.every(tag => !tag.hasAttribute('aria-disabled')));
                  expect(tags.map(tag => tag.tabIndex)).to.deep.equal([0, -1, -1]);
                },
              },
            },
          },
          selection: {
            description: 'selection',
            tests: {
              noneIgnoresSelection: {
                description: 'does not select or emit change when selection is none',
                test: async () => {
                  const group = this.component;
                  const handler = sinon.spy();
                  group.addEventListener('change', handler);
                  const tags = this.tags();
                  tags[0].click();
                  group.focus();
                  await sendKeys({ press: 'Space' });
                  await elementUpdated(group);
                  expect(tags.some(tag => tag.selected)).to.be.false;
                  expect(handler).to.have.callCount(0);
                  expect(group.valueAsArray).to.deep.equal([]);
                },
              },
              singleSelection: {
                description: 'single selection keeps one selected tag and can toggle it off',
                test: async () => {
                  const group = this.component;
                  group.selection = 'single';
                  await elementUpdated(group);
                  const tags = this.tags();
                  setTimeout(() => tags[0].click());
                  let event = (await oneEvent(group, 'change')) as CustomEvent;
                  expect(event.detail.valueAsArray).to.deep.equal(['apple']);
                  expect(event.detail.value).to.equal('apple');

                  setTimeout(() => tags[2].click());
                  event = (await oneEvent(group, 'change')) as CustomEvent;
                  expect(event.detail.valueAsArray).to.deep.equal(['cherry']);
                  expect(tags.map(tag => tag.selected)).to.deep.equal([false, false, true]);
                  expect(tags.map(tag => tag.getAttribute('aria-selected'))).to.deep.equal(['false', 'false', 'true']);

                  setTimeout(() => tags[2].click());
                  event = (await oneEvent(group, 'change')) as CustomEvent;
                  expect(event.detail.valueAsArray).to.deep.equal([]);
                },
              },
              multipleSelectionKeyboard: {
                description: 'multiple selection toggles tags with Space and Enter and selects all with Ctrl+A',
                test: async () => {
                  const group = this.component;
                  group.selection = 'multiple';
                  await elementUpdated(group);
                  const tags = this.tags();
                  group.focus();
                  const first = oneEvent(group, 'change');
                  await sendKeys({ press: 'Space' });
                  await first;
                  await sendKeys({ press: 'ArrowRight' });
                  const second = oneEvent(group, 'change');
                  await sendKeys({ press: 'Enter' });
                  await second;
                  expect(group.valueAsArray).to.deep.equal(['apple', 'banana']);
                  expect(group.value).to.equal('apple,banana');

                  const third = oneEvent(group, 'change');
                  await sendKeys({ press: 'Control+a' });
                  await third;
                  expect(group.valueAsArray).to.deep.equal(['apple', 'banana', 'cherry']);
                  expect(tags.every(tag => tag.getAttribute('aria-selected') === 'true')).to.be.true;
                },
              },
              disabledTagNotSelectable: {
                description: 'does not select a disabled tag',
                test: async () => {
                  const group = this.component;
                  group.selection = 'multiple';
                  const tags = this.tags();
                  tags[1].disabled = true;
                  await elementUpdated(group);
                  const handler = sinon.spy();
                  group.addEventListener('change', handler);
                  tags[1].click();
                  await elementUpdated(group);
                  expect(tags[1].selected).to.be.false;
                  expect(handler).to.have.callCount(0);
                },
              },
              controlledValue: {
                description: 'setting valueAsArray or value selects matching tags without emitting change',
                test: async () => {
                  const group = this.component;
                  group.selection = 'multiple';
                  const handler = sinon.spy();
                  group.addEventListener('change', handler);
                  group.valueAsArray = ['banana', 'cherry', 'missing'];
                  await elementUpdated(group);
                  const tags = this.tags();
                  expect(tags.map(tag => tag.selected)).to.deep.equal([false, true, true]);
                  expect(group.valueAsArray).to.deep.equal(['banana', 'cherry']);

                  group.value = 'apple';
                  await elementUpdated(group);
                  expect(tags.map(tag => tag.selected)).to.deep.equal([true, false, false]);
                  expect(handler).to.have.callCount(0);
                },
              },
              singleModeTrimsExtraSelections: {
                description: 'switching to single selection keeps only the first selected tag',
                test: async () => {
                  const group = this.component;
                  group.selection = 'multiple';
                  group.valueAsArray = ['apple', 'cherry'];
                  await elementUpdated(group);
                  group.selection = 'single';
                  await elementUpdated(group);
                  expect(group.valueAsArray).to.deep.equal(['apple']);
                  group.selection = 'none';
                  await elementUpdated(group);
                  expect(group.valueAsArray).to.deep.equal([]);
                },
              },
              removeClickDoesNotSelect: {
                description: 'clicking a tag remove button does not toggle selection',
                test: async () => {
                  const group = this.component;
                  group.selection = 'multiple';
                  await elementUpdated(group);
                  const [tag] = this.tags();
                  const handler = sinon.spy();
                  group.addEventListener('change', handler);
                  (tag.shadowRoot?.querySelector('[part="tag-remove"]') as HTMLButtonElement).click();
                  await elementUpdated(group);
                  expect(tag.selected).to.be.false;
                  expect(handler).to.have.callCount(0);
                },
              },
            },
          },
        },
      },
    });
  }

  protected list(): HTMLElement {
    return this.component.shadowRoot?.querySelector('[part="tag-group-list"]') as HTMLElement;
  }

  protected tags(): CoreTag[] {
    return [...this.component.children].filter((child): child is CoreTag => child.localName === 'ch-tag');
  }

  /** Waits for the group to have reconciled its slotted tags. */
  protected async ready() {
    await elementUpdated(this.component);
    await waitUntil(() => this.tags().every(tag => tag.hasAttribute('role')));
  }
}
