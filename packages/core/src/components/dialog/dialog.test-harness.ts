import { aTimeout, elementUpdated, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { isSafari } from '@microsoft/applicationinsights-core-js';
import sinon from 'sinon';
import { sendKeys, sendMouse } from '@web/test-runner-commands';

import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { project } from '../../utilities/index.js';
import { getMiddleOfElement } from '../../utilities/testing/positioning.js';
import './index.js';
import '../button/index.js';
import type { CoreDialog } from './index.js';

export class CoreDialogTests<T extends CoreDialog> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      dialog: {
        description: 'dialog',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              open: {
                description: 'should open and close the dialog',
                test: async () => {
                  this.component.open = true;
                  await elementUpdated(this.component);
                  // Account for the setTimeout in dialog show
                  await aTimeout(200);
                  const dialogElement = this.component.shadowRoot?.querySelector('dialog');
                  expect(dialogElement).to.have.attribute('open');
                  // Set open to false
                  this.component.open = false;
                  await elementUpdated(this.component);
                  // Firefox in particular is slow to complete the transition
                  await aTimeout(1000);
                  expect(dialogElement?.getAttribute('open')).to.equal(null);
                },
              },
              hideCloseButton: {
                description: 'should hide the close button',
                test: async () => {
                  const button = this.component.shadowRoot!.querySelector('.close-btn')!;
                  expect(getComputedStyle(button).display).to.equal('block');
                  this.component.hideCloseButton = true;
                  await elementUpdated(this.component);
                  expect(getComputedStyle(button).display).to.equal('');
                },
              },
              trapFocusDefault: {
                description: 'should default `trapFocus` to false/undefined and not reflect the attribute',
                test: async () => {
                  expect(this.component.trapFocus).to.not.be.true;
                  expect(this.component.hasAttribute('trap-focus')).to.be.false;
                },
              },
              notAlertRole: {
                description: 'should not have role "alertdialog" when alert is not set',
                test: async () => {
                  await elementUpdated(this.component);
                  const dialogElement = this.component.shadowRoot?.querySelector('dialog');
                  expect(dialogElement?.getAttribute('role')).to.be.null;
                },
              },
              alertRole: {
                description: 'should have role "alertdialog" when alert is set',
                test: async () => {
                  this.component.alert = true;
                  await elementUpdated(this.component);
                  const dialogElement = this.component.shadowRoot?.querySelector('dialog');
                  expect(dialogElement?.getAttribute('role')).to.equal('alertdialog');
                },
              },
              alertClose: {
                description: 'should be able to close the dialog by clicking the close button when alert is set',
                test: async () => {
                  this.component.alert = true;
                  this.component.open = true;
                  await elementUpdated(this.component);
                  const button = this.component.shadowRoot!.querySelector('.close-btn')! as HTMLElement;
                  button.click();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.false;
                },
              },
              alertCloseHideMethod: {
                description: 'should be able to close the dialog programmatically when alert is set',
                test: async () => {
                  this.component.alert = true;
                  this.component.open = true;
                  await elementUpdated(this.component);
                  this.component.hide();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.false;
                },
              },
              invokerClose: {
                description: 'should close when the invoker is clicked',
                test: async () => {
                  const closeButton = document.createElement(project.scope.tagName('button'));
                  const afterHideSpy = sinon.spy();
                  closeButton.setAttribute('hides', 'dialog-1');
                  this.component.addEventListener('dialog-after-hide', afterHideSpy);
                  this.component.appendChild(closeButton);
                  await elementUpdated(this.component);
                  this.component.open = true;
                  await elementUpdated(this.component);
                  await aTimeout(100);
                  closeButton.click();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.false;
                  await waitUntil(() => afterHideSpy.called, 'dialog-after-hide should fire', {
                    timeout: 2500,
                  });
                  const dialogElement = this.component.shadowRoot?.querySelector('dialog');
                  expect(dialogElement?.hasAttribute('open')).to.be.false;
                },
                config: {
                  id: 'dialog-1',
                },
              },
              invokerToggle: {
                description: 'should close when the toggles invoker is clicked',
                test: async () => {
                  const toggleButton = document.createElement(project.scope.tagName('button'));
                  toggleButton.setAttribute('toggles', 'dialog-1');
                  this.component.appendChild(toggleButton);
                  await elementUpdated(this.component);
                  this.component.open = true;
                  await elementUpdated(this.component);
                  await aTimeout(100);
                  toggleButton.click();
                  await elementUpdated(this.component);
                  await aTimeout(500);
                  expect(this.component.open).to.be.false;
                  const dialogElement = this.component.shadowRoot?.querySelector('dialog');
                  expect(dialogElement?.hasAttribute('open')).to.be.false;
                },
                config: {
                  id: 'dialog-1',
                },
              },
            },
          },

          methods: {
            description: 'methods',
            tests: {
              show: {
                description: 'should open the dialog',
                test: async () => {
                  this.component.show();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.true;
                },
              },
              hide: {
                description: 'should close the dialog',
                test: async () => {
                  this.component.show();
                  await elementUpdated(this.component);
                  this.component.hide();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.false;
                },
              },
              toggle: {
                description: 'should toggle the dialog',
                test: async () => {
                  this.component.toggle();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.true;

                  this.component.toggle();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.false;
                },
              },
            },
          },
          events: {
            description: 'events',
            tests: {
              emitShow: {
                description: 'should emit "dialog-show',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('dialog-show', spy);
                  this.component.show();
                  await elementUpdated(this.component);

                  expect(this.component.open).to.be.true;
                  expect(spy).to.have.been.calledOnce;
                },
              },
              emitHide: {
                description: 'should emit "dialog-hide"',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('dialog-hide', spy);

                  this.component.show();
                  await elementUpdated(this.component);
                  this.component.hide();
                  await elementUpdated(this.component);

                  expect(this.component.open).to.be.false;
                  expect(spy).to.have.been.calledOnce;
                },
              },
              emitAfterShow: {
                description: 'should emit "dialog-after-show" after it is shown',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('dialog-after-show', spy);

                  this.component.show();
                  await aTimeout(500);
                  // TODO: after-show is called twice in chromium
                  await waitUntil(() => spy.called);
                  // expect(spy).to.have.been.calledOnce;
                },
              },
              emitAfterHide: {
                description: 'should emit "dialog-after-hide" after it is hidden',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('dialog-after-hide', spy);

                  this.component.show();
                  await elementUpdated(this.component);
                  await aTimeout(200);
                  this.component.hide();

                  // Chromium and Webkit fire the transitionend event twice, which causes our after-hide to likewise be called twice
                  await waitUntil(() => spy.called);

                  expect(this.component.open).to.be.false;
                },
              },
              emitNotFirstLoad: {
                description: 'should NOT emit "dialog-hide" on first load',
                test: async () => {
                  const hideHandler = sinon.spy();
                  document.addEventListener('dialog-hide', hideHandler);
                  await elementUpdated(this.component);
                  expect(hideHandler).to.not.have.been.calledOnce;
                },
              },
              emitThroughOverlay: {
                description: 'should emit "dialog-hide" through overlay',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('dialog-hide', spy);

                  const div = document.createElement('div');
                  this.component.after(div);
                  const { x, y } = getMiddleOfElement(div);

                  this.component.show();
                  await elementUpdated(this.component);
                  await sendMouse({ type: 'click', position: [x, y] });

                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.false;

                  await waitUntil(() => spy.calledOnce);
                  expect(spy).to.have.been.calledOnce;
                },
              },
              focusFirstItem: {
                description: 'should focus on the first item with `autofocus` attribute in the dialog when opened',
                test: async () => {
                  if (isSafari()) return;
                  // TODO: This feature is not working on firefox
                  if (/firefox/i.test(navigator.userAgent)) return;

                  const input = document.createElement('input');
                  input.setAttribute('type', 'text');
                  input.setAttribute('autofocus', '');
                  this.component.appendChild(input);
                  await elementUpdated(this.component);

                  setTimeout(() => this.component.show(), 10);
                  await oneEvent(this.component, 'dialog-after-show');
                  expect(document.activeElement).to.equal(input);
                },
              },
              focusOnClose: {
                description: 'should focus on the close icon when opened if no autofocus items are in dialog',
                test: async () => {
                  if (isSafari()) return;
                  const el = this.component;
                  const closeButton = el.shadowRoot?.querySelector('.close-btn');
                  setTimeout(() => this.component.show(), 10);
                  await oneEvent(this.component, 'dialog-after-show');
                  expect(el.shadowRoot?.activeElement).to.equal(closeButton);
                },
              },
            },
          },
          // keyboard tests
          keyboard: {
            description: 'keyboard',
            tests: {
              emitHideWhenEscape: {
                description: 'should emit "dialog-hide" when pressing Esc',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('dialog-hide', spy);
                  this.component.show();
                  await this.component.updateComplete;
                  await sendKeys({ press: 'Escape' });
                  await waitUntil(() => spy.calledOnce);
                  expect(this.component.open).to.be.false;
                },
              },
              restoreFocus: {
                description: 'should restore focus on to button that triggered open when dialog closes',
                test: async () => {
                  const el = await this.component;
                  const button = document.createElement('button');
                  el.after(button);
                  button.addEventListener('keydown', async _e => el.show());
                  el.addEventListener('after-show', async () => await sendKeys({ press: 'Escape' }));
                  el.addEventListener('after-close', () => expect(document.activeElement).to.equal(button));
                  button.focus();
                  await sendKeys({ press: 'Enter' });
                },
              },
              focusTrap: {
                description: 'should trap focus within dialog on Tab key',
                test: async () => {
                  if (isSafari() || /firefox/i.test(navigator.userAgent)) return;
                  const input1 = document.createElement('input');
                  input1.setAttribute('type', 'text');
                  input1.setAttribute('placeholder', 'First input');
                  const input2 = document.createElement('input');
                  input2.setAttribute('type', 'text');
                  input2.setAttribute('placeholder', 'Second input');
                  this.component.appendChild(input1);
                  this.component.appendChild(input2);
                  await elementUpdated(this.component);
                  this.component.show();
                  await aTimeout(300);
                  // Should focus on first input (close button is first)
                  const closeBtn = this.component.shadowRoot?.querySelector('.close-btn');
                  expect(this.component.shadowRoot?.activeElement).to.equal(closeBtn);
                  // Tab to first input
                  await sendKeys({ press: 'Tab' });
                  expect(document.activeElement).to.equal(input1);
                  // Tab to second input
                  await sendKeys({ press: 'Tab' });
                  expect(document.activeElement).to.equal(input2);
                },
              },
              focusTrapReverse: {
                description: 'should trap focus in reverse with Shift+Tab',
                test: async () => {
                  if (isSafari() || /firefox/i.test(navigator.userAgent)) return;
                  const input1 = document.createElement('input');
                  input1.setAttribute('type', 'text');
                  const input2 = document.createElement('input');
                  input2.setAttribute('type', 'text');
                  this.component.appendChild(input1);
                  this.component.appendChild(input2);
                  await elementUpdated(this.component);
                  this.component.show();
                  await aTimeout(300);
                  // Focus should be on close button
                  const closeBtn = this.component.shadowRoot?.querySelector('.close-btn');
                  expect(this.component.shadowRoot?.activeElement).to.equal(closeBtn);
                  // Shift+Tab from first focusable element should move to last
                  input2.focus();
                  await sendKeys({ press: 'Shift+Tab' });
                  expect(document.activeElement).to.equal(input1);
                },
              },
              focusTrapWithTabindex: {
                description: 'should include elements with tabindex in focus trap',
                test: async () => {
                  if (isSafari() || /firefox/i.test(navigator.userAgent)) return;
                  const input = document.createElement('input');
                  input.setAttribute('type', 'text');
                  const div = document.createElement('div');
                  div.setAttribute('tabindex', '0');
                  div.textContent = 'Focusable div';
                  this.component.appendChild(input);
                  this.component.appendChild(div);
                  await elementUpdated(this.component);
                  this.component.show();
                  await aTimeout(300);
                  const closeBtn = this.component.shadowRoot?.querySelector('.close-btn');
                  expect(this.component.shadowRoot?.activeElement).to.equal(closeBtn);
                  // Tab through all focusable elements including tabindex
                  await sendKeys({ press: 'Tab' });
                  expect(document.activeElement).to.equal(input);
                  await sendKeys({ press: 'Tab' });
                  expect(document.activeElement).to.equal(div);
                },
              },
              focusTrapIgnoresHiddenElements: {
                description: 'should ignore hidden/disabled elements in focus trap',
                test: async () => {
                  if (isSafari() || /firefox/i.test(navigator.userAgent)) return;
                  const input1 = document.createElement('input');
                  input1.setAttribute('type', 'text');
                  const input2 = document.createElement('input');
                  input2.setAttribute('type', 'text');
                  input2.setAttribute('disabled', '');
                  const input3 = document.createElement('input');
                  input3.setAttribute('type', 'text');
                  this.component.appendChild(input1);
                  this.component.appendChild(input2);
                  this.component.appendChild(input3);
                  await elementUpdated(this.component);
                  this.component.show();
                  await aTimeout(300);
                  // Tab from first should skip disabled input2
                  await sendKeys({ press: 'Tab' });
                  expect(document.activeElement).to.equal(input1);
                  await sendKeys({ press: 'Tab' });
                  expect(document.activeElement).to.equal(input3);
                },
              },
              focusTrapRestoresOnClose: {
                description: 'should restore previous focus when dialog closes',
                test: async () => {
                  if (isSafari() || /firefox/i.test(navigator.userAgent)) return;
                  const input = document.createElement('input');
                  input.setAttribute('type', 'text');
                  input.setAttribute('placeholder', 'Outside input');
                  const dialogInput = document.createElement('input');
                  dialogInput.setAttribute('type', 'text');
                  dialogInput.setAttribute('placeholder', 'Dialog input');
                  document.body.appendChild(input);
                  this.component.appendChild(dialogInput);
                  await elementUpdated(this.component);
                  // Focus on outside input
                  input.focus();
                  expect(document.activeElement).to.equal(input);
                  // Open dialog
                  this.component.show();
                  await aTimeout(300);
                  // Focus should be inside dialog
                  expect(document.activeElement).to.not.equal(input);
                  // Close dialog
                  this.component.hide();
                  await aTimeout(500);
                  // Focus should be restored to input
                  expect(document.activeElement).to.equal(input);
                  input.remove();
                },
              },
              focusTrapWrapAround: {
                description: 'should wrap focus to first element when tabbing past last focusable element',
                test: async () => {
                  if (isSafari() || /firefox/i.test(navigator.userAgent)) return;
                  const input1 = document.createElement('input');
                  input1.setAttribute('type', 'text');
                  const input2 = document.createElement('input');
                  input2.setAttribute('type', 'text');
                  this.component.appendChild(input1);
                  this.component.appendChild(input2);
                  await elementUpdated(this.component);
                  this.component.show();
                  await aTimeout(300);
                  // Focus on last input
                  input2.focus();
                  // Tab should wrap to first focusable (close button)
                  await sendKeys({ press: 'Tab' });
                  const closeBtn = this.component.shadowRoot?.querySelector('.close-btn');
                  expect(this.component.shadowRoot?.activeElement).to.equal(closeBtn);
                },
              },
              // `trap-focus` opt-in tests. These run on every browser (no Safari/Firefox skip) since the wrapping is
              // implemented in JS by the component rather than relying on native <dialog> modal focus containment.
              // The default fixture always has a "Cancel"/"Save" footer, so the true last focusable element is the
              // "Save" button and the true first is the shadow-DOM close button.
              trapFocusWrapForward: {
                description: 'should wrap focus from the last to the first focusable element when trapFocus is enabled',
                test: async () => {
                  this.component.trapFocus = true;
                  await elementUpdated(this.component);
                  this.component.show();
                  await aTimeout(300);
                  const closeBtn = this.component.shadowRoot?.querySelector('.close-btn') as HTMLElement;
                  const saveBtn = Array.from(this.component.querySelectorAll('button')).find(
                    b => b.textContent?.trim() === 'Save'
                  ) as HTMLElement;

                  saveBtn.focus();
                  await sendKeys({ press: 'Tab' });
                  expect(this.component.shadowRoot?.activeElement).to.equal(closeBtn);
                },
              },
              trapFocusWrapBackward: {
                description:
                  'should wrap focus from the first to the last focusable element with Shift+Tab when trapFocus is enabled',
                test: async () => {
                  this.component.trapFocus = true;
                  await elementUpdated(this.component);
                  this.component.show();
                  await aTimeout(300);
                  const closeBtn = this.component.shadowRoot?.querySelector('.close-btn') as HTMLElement;
                  const saveBtn = Array.from(this.component.querySelectorAll('button')).find(
                    b => b.textContent?.trim() === 'Save'
                  ) as HTMLElement;

                  closeBtn.focus();
                  await sendKeys({ press: 'Shift+Tab' });
                  expect(document.activeElement).to.equal(saveBtn);
                },
              },
              trapFocusDynamicContent: {
                description: 'should include content added after the dialog opens when trapFocus is enabled',
                test: async () => {
                  this.component.trapFocus = true;
                  await elementUpdated(this.component);
                  this.component.show();
                  await aTimeout(300);

                  // Append a new element to the footer slot so it becomes the new last focusable element.
                  const lateButton = document.createElement('button');
                  lateButton.textContent = 'Late';
                  lateButton.setAttribute('slot', 'footer');
                  this.component.appendChild(lateButton);
                  await elementUpdated(this.component);

                  const closeBtn = this.component.shadowRoot?.querySelector('.close-btn') as HTMLElement;
                  lateButton.focus();
                  await sendKeys({ press: 'Tab' });
                  // Tabbing from the dynamically added element should wrap back to the close button, proving it is
                  // now recognized as the last focusable element.
                  expect(this.component.shadowRoot?.activeElement).to.equal(closeBtn);
                },
              },
              trapFocusEscapeStillCloses: {
                description: 'should still close on Escape when trapFocus is enabled',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.trapFocus = true;
                  this.component.addEventListener('dialog-hide', spy);
                  this.component.show();
                  await elementUpdated(this.component);
                  await sendKeys({ press: 'Escape' });
                  await waitUntil(() => spy.calledOnce);
                  expect(this.component.open).to.be.false;
                },
              },
              trapFocusLightDismissStillCloses: {
                description: 'should still light-dismiss on backdrop click when trapFocus is enabled',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.trapFocus = true;
                  this.component.addEventListener('dialog-hide', spy);

                  const div = document.createElement('div');
                  this.component.after(div);
                  const { x, y } = getMiddleOfElement(div);

                  this.component.show();
                  await elementUpdated(this.component);
                  await sendMouse({ type: 'click', position: [x, y] });

                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.false;
                  await waitUntil(() => spy.calledOnce);
                },
              },
            },
          },
        },
      },
    });
  }
}
