import { elementUpdated, expect, oneEvent } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { FocusableElementTests } from '../../base/focusable-element/focusable-element.test-harness.js';
import type { CoreTag } from './index.js';

export class CoreTagTests<T extends CoreTag> extends FocusableElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      focusableElement: {
        description: 'focusable-element',
        tests: {
          events: {
            description: 'events',
            tests: {
              // A tag host only takes focus when a group gives it a tabindex; standalone focus goes to the remove button.
              focus: {
                description: 'emits a `focus` event when focused through a group-managed tabindex',
                test: async () => {
                  const el = this.component;
                  el.managedFocus = true;
                  el.tabIndex = 0;
                  await elementUpdated(el);
                  const focusHandler = sinon.spy();
                  el.addEventListener('focus', focusHandler);
                  el.focus();
                  await elementUpdated(el);
                  expect(focusHandler).to.have.been.callCount(1);
                  expect(document.activeElement).to.equal(el);
                },
              },
              blur: {
                description: 'emits a `blur` event when blurred through a group-managed tabindex',
                test: async () => {
                  const el = this.component;
                  el.managedFocus = true;
                  el.tabIndex = 0;
                  await elementUpdated(el);
                  const blurHandler = sinon.spy();
                  el.addEventListener('blur', blurHandler);
                  el.focus();
                  el.blur();
                  await elementUpdated(el);
                  expect(blurHandler).to.have.been.callCount(1);
                },
              },
            },
          },
        },
      },
      tag: {
        description: 'tag',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              removable: {
                description: 'renders the remove button only when removable',
                test: async () => {
                  const el = this.component;
                  el.removable = false;
                  await elementUpdated(el);
                  expect(this.removeButton()).to.be.null;

                  el.removable = true;
                  await elementUpdated(el);
                  expect(this.removeButton()).to.not.be.null;
                  expect(this.removeButton()?.getAttribute('type')).to.equal('button');
                },
              },
              disabled: {
                description: 'reflects disabled, sets aria-disabled, and disables the remove button',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await elementUpdated(el);
                  expect(el.hasAttribute('disabled')).to.be.true;
                  expect(el.getAttribute('aria-disabled')).to.equal('true');
                  expect(this.removeButton()?.disabled).to.be.true;

                  el.disabled = false;
                  await elementUpdated(el);
                  expect(el.hasAttribute('aria-disabled')).to.be.false;
                  expect(this.removeButton()?.disabled).to.be.false;
                },
              },
              selected: {
                description: 'reflects the selected state without adding ARIA selection on its own',
                test: async () => {
                  const el = this.component;
                  el.selected = true;
                  await elementUpdated(el);
                  expect(el.hasAttribute('selected')).to.be.true;
                  expect(el.hasAttribute('aria-selected')).to.be.false;
                  expect(el.hasAttribute('aria-checked')).to.be.false;
                },
              },
              noRole: {
                description: 'does not set a role on the host; the containing group owns list semantics',
                test: async () => {
                  await elementUpdated(this.component);
                  expect(this.component.hasAttribute('role')).to.be.false;
                },
              },
            },
          },
          slots: {
            description: 'slots',
            tests: {
              defaultSlot: {
                description: 'renders the default slot inside the content part',
                test: async () => {
                  await elementUpdated(this.component);
                  const content = this.component.shadowRoot?.querySelector('[part="tag-content"]');
                  expect(content?.querySelector('slot:not([name])')).to.not.be.null;
                },
              },
              startSlot: {
                description: 'renders the start slot',
                test: async () => {
                  this.component.innerHTML = '<span slot="start">Start</span>Apple';
                  await elementUpdated(this.component);
                  const slot = this.component.shadowRoot?.querySelector('slot[name="start"]') as HTMLSlotElement;
                  expect(slot.assignedElements()).to.have.lengthOf(1);
                },
              },
              endSlot: {
                description: 'renders the end slot',
                test: async () => {
                  this.component.innerHTML = 'Apple<span slot="end">End</span>';
                  await elementUpdated(this.component);
                  const slot = this.component.shadowRoot?.querySelector('slot[name="end"]') as HTMLSlotElement;
                  expect(slot.assignedElements()).to.have.lengthOf(1);
                },
              },
              removeLabelSlot: {
                description: 'uses slotted remove-label text in place of the default',
                test: async () => {
                  this.component.innerHTML = 'Manzana<span slot="remove-label">Quitar</span>';
                  await elementUpdated(this.component);
                  const slot = this.component.shadowRoot?.querySelector('slot[name="remove-label"]') as HTMLSlotElement;
                  expect(slot.assignedElements()).to.have.lengthOf(1);
                  expect(slot.assignedElements()[0].textContent).to.equal('Quitar');
                },
              },
            },
          },
          accessibility: {
            description: 'accessibility',
            tests: {
              presentationalRemove: {
                description: 'renders a non-focusable, aria-hidden remove control when exposed as a listbox option',
                test: async () => {
                  const el = this.component;
                  el.managedFocus = true;
                  el.presentationalRemove = true;
                  el.tabIndex = 0;
                  await elementUpdated(el);
                  const control = el.shadowRoot?.querySelector('[part="tag-remove"]') as HTMLElement;
                  expect(control.localName).to.equal('span');
                  expect(control.getAttribute('aria-hidden')).to.equal('true');
                  expect(el.shadowRoot?.querySelector('button')).to.be.null;
                  setTimeout(() => control.click());
                  const event = (await oneEvent(el, 'tag-remove')) as CustomEvent;
                  expect(event.detail.value).to.equal('apple');
                  await expect(el).to.be.accessible();
                },
              },
              removeButtonName: {
                description: 'names the remove button with visually hidden DOM text plus the tag content',
                test: async () => {
                  await elementUpdated(this.component);
                  const button = this.removeButton()!;
                  const ids = button.getAttribute('aria-labelledby')?.split(' ') ?? [];
                  expect(ids).to.include('remove-label');
                  expect(ids).to.include('content');
                  for (const id of ids) {
                    expect(this.component.shadowRoot?.getElementById(id)).to.not.be.null;
                  }
                  const label = this.component.shadowRoot?.getElementById('remove-label');
                  expect(label?.classList.contains('visually-hidden')).to.be.true;
                  expect(label?.textContent?.trim()).to.equal('Remove');
                  expect(button.hasAttribute('aria-label')).to.be.false;
                },
              },
              standaloneRemoveButtonIsTabbable: {
                description: 'keeps the remove button in the tab order when no group manages focus',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  expect(el.hasAttribute('tabindex')).to.be.false;
                  expect(this.removeButton()?.tabIndex).to.equal(0);
                  this.removeButton()?.focus();
                  expect(el.shadowRoot?.activeElement).to.equal(this.removeButton());
                },
              },
              managedFocusRemovesButtonTabStop: {
                description: 'takes the remove button out of the tab order when a group manages focus',
                test: async () => {
                  const el = this.component;
                  el.managedFocus = true;
                  await elementUpdated(el);
                  expect(this.removeButton()?.tabIndex).to.equal(-1);
                  el.tabIndex = 0;
                  el.focus();
                  expect(document.activeElement).to.equal(el);
                  expect(el.shadowRoot?.activeElement).to.be.null;
                },
              },
              forceDisabled: {
                description: 'forceDisabled disables the tag without changing its own disabled property',
                test: async () => {
                  const el = this.component;
                  el.forceDisabled = true;
                  await elementUpdated(el);
                  expect(el.disabled).to.be.false;
                  expect(el.isDisabled).to.be.true;
                  expect(el.getAttribute('aria-disabled')).to.equal('true');
                  expect(this.removeButton()?.disabled).to.be.true;
                  el.forceDisabled = false;
                  await elementUpdated(el);
                  expect(el.hasAttribute('aria-disabled')).to.be.false;
                },
              },
            },
          },
          events: {
            description: 'events',
            tests: {
              removeClick: {
                description: 'emits a cancelable tag-remove with the value when the remove button is clicked',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  setTimeout(() => this.removeButton()?.click());
                  const event = (await oneEvent(el, 'tag-remove')) as CustomEvent;
                  expect(event.cancelable).to.be.true;
                  expect(event.composed).to.be.true;
                  expect(event.detail.value).to.equal('apple');
                  expect(el.isConnected).to.be.true;
                },
              },
              removeDeleteKey: {
                description: 'emits tag-remove when Delete is pressed while the remove button is focused',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  this.removeButton()?.focus();
                  setTimeout(() => sendKeys({ press: 'Delete' }));
                  const event = (await oneEvent(el, 'tag-remove')) as CustomEvent;
                  expect(event.detail.value).to.equal('apple');
                },
              },
              removeBackspaceKey: {
                description: 'emits tag-remove when Backspace is pressed while the host is focused (group mode)',
                test: async () => {
                  const el = this.component;
                  el.managedFocus = true;
                  el.tabIndex = 0;
                  await elementUpdated(el);
                  el.focus();
                  setTimeout(() => sendKeys({ press: 'Backspace' }));
                  const event = (await oneEvent(el, 'tag-remove')) as CustomEvent;
                  expect(event.detail.value).to.equal('apple');
                },
              },
              handledKeysAreCanceled: {
                description: 'cancels Delete and Backspace synchronously so an enclosing group does not act on them',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  for (const key of ['Delete', 'Backspace']) {
                    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
                    el.dispatchEvent(event);
                    expect(event.defaultPrevented, key).to.be.true;
                  }
                },
              },
              otherKeysIgnored: {
                description: 'does not emit or cancel navigation keys; those belong to the group',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  const handler = sinon.spy();
                  el.addEventListener('tag-remove', handler);
                  const target = el;
                  for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End', ' ', 'Enter']) {
                    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
                    target.dispatchEvent(event);
                    expect(event.defaultPrevented, key).to.be.false;
                  }
                  expect(handler).to.have.callCount(0);
                },
              },
              disabledDoesNotEmit: {
                description: 'does not emit tag-remove when disabled',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await elementUpdated(el);
                  const handler = sinon.spy();
                  el.addEventListener('tag-remove', handler);
                  this.removeButton()?.click();
                  const target = el;
                  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
                  await elementUpdated(el);
                  expect(handler).to.have.callCount(0);
                },
              },
              notRemovableDoesNotEmit: {
                description: 'does not emit tag-remove from keys when not removable',
                test: async () => {
                  const el = this.component;
                  el.removable = false;
                  await elementUpdated(el);
                  const handler = sinon.spy();
                  el.addEventListener('tag-remove', handler);
                  const target = el;
                  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
                  await elementUpdated(el);
                  expect(handler).to.have.callCount(0);
                },
              },
              removeIsCancelable: {
                description: 'a listener can cancel tag-remove',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  el.addEventListener('tag-remove', e => e.preventDefault(), { once: true });
                  setTimeout(() => this.removeButton()?.click());
                  const event = (await oneEvent(el, 'tag-remove')) as CustomEvent;
                  expect(event.defaultPrevented).to.be.true;
                },
              },
            },
          },
        },
      },
    });
  }

  protected removeButton(): HTMLButtonElement | null {
    return this.component.shadowRoot?.querySelector('[part="tag-remove"]') ?? null;
  }
}
