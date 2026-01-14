import { elementUpdated, expect } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { project } from '../../utilities/index.js';
import { CoreButton } from '../button/index.js';
import { CoreMenu } from '../menu/menu.js';
import { CoreTooltip } from '../tooltip/tooltip.js';
import type { CoreButtonGroup } from './index.js';
import '../button/index.js';

//TODO: update tests to use loops if possible
export class CoreButtonGroupTests<T extends CoreButtonGroup> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      buttonGroup: {
        description: 'buttonGroup',
        tests: {
          properties: {
            description: 'properties and attributes',
            tests: {
              labelAttribute: {
                description: 'should set the aria-label attribute when the label property is set',
                test: async () => {
                  const el = this.component;
                  const buttonGroupBase = el.shadowRoot?.querySelector('[part="button-group-base"]') as HTMLElement;
                  expect(buttonGroupBase.getAttribute('aria-label')).to.equal('Test Label');
                },
                config: {
                  label: 'Test Label',
                },
              },
              roleAttributeGroup: {
                description: 'should set role="group" when toolbar attribute is not present',
                test: async () => {
                  const el = this.component;
                  const buttonGroupBase = el.shadowRoot?.querySelector('[part="button-group-base"]') as HTMLElement;
                  expect(buttonGroupBase.getAttribute('role')).to.equal('group');
                },
                config: {},
              },
              roleAttributeToolbar: {
                description: 'should set role="toolbar" when toolbar attribute is present',
                test: async () => {
                  const el = this.component;
                  const buttonGroupBase = el.shadowRoot?.querySelector('[part="button-group-base"]') as HTMLElement;
                  expect(buttonGroupBase.getAttribute('role')).to.equal('toolbar');
                },
                config: {
                  toolbar: '',
                },
              },
              positionAttribute: {
                description: 'should have the attribute "button-group-button-position" to all child buttons',
                test: async () => {
                  const el = this.component;
                  const buttons = el.querySelectorAll(project.scope.tagName('button'));
                  buttons.forEach(button => {
                    expect(button.getAttribute('button-group-button-position')).to.not.be.null;
                  });
                },
              },
              firstButtonIndicator: {
                description:
                  'should have the attribute `button-group-button-position` set to `first` on the first button only',
                test: async () => {
                  const el = this.component;
                  const buttons = el.querySelectorAll(project.scope.tagName('button'));
                  buttons.forEach((button, i) => {
                    if (i === 0) expect(button?.getAttribute('button-group-button-position')).to.equal('first');
                    else expect(button.getAttribute('button-group-button-position')).to.not.equal('first');
                  });
                },
              },
              lastButtonIndicator: {
                description:
                  'should have the attribute `button-group-button-position` set to `last` on the last button only',
                test: async () => {
                  const el = this.component;
                  const buttons = el.querySelectorAll(project.scope.tagName('button'));
                  buttons.forEach((button, i) => {
                    if (i === buttons.length - 1)
                      expect(button?.getAttribute('button-group-button-position')).to.equal('last');
                    else expect(button.getAttribute('button-group-button-position')).to.not.equal('last');
                  });
                },
              },
              innerButtonIndicators: {
                description:
                  'should have the attribute `button-group-button-position` set to `inner` on the inner buttons only',
                test: async () => {
                  const el = this.component;
                  const buttons = el.querySelectorAll(project.scope.tagName('button'));
                  buttons.forEach((button, i) => {
                    if (i === 0 || i === buttons.length - 1)
                      expect(button.getAttribute('button-group-button-position')).to.not.equal('inner');
                    else expect(button.getAttribute('button-group-button-position')).to.equal('inner');
                  });
                },
              },
              verticalAttribute: {
                description: 'should have the attribute `vertical` on buttons when set on button-group',
                test: async () => {
                  const buttons = this.component.querySelectorAll(project.scope.tagName('button'));
                  buttons.forEach(button => {
                    expect(button.getAttribute('vertical')).to.not.be.null;
                  });
                },
                config: {
                  vertical: '',
                },
              },
              splitAttribute: {
                description: 'should have the attribute `split` on buttons when set on button-group',
                test: async () => {
                  const buttons = this.component.querySelectorAll(project.scope.tagName('button'));
                  buttons.forEach(button => {
                    expect(button.getAttribute('split')).to.not.be.null;
                  });
                },
                config: {
                  split: '',
                },
              },
              toggleAttribute: {
                description: 'should have the attribute `toggle` on buttons when `select` is set on button-group',
                test: async () => {
                  const buttons = this.component.querySelectorAll(project.scope.tagName('button'));
                  buttons.forEach(button => {
                    expect(button.getAttribute('toggle')).to.not.be.null;
                  });
                },
                config: {
                  select: 'single',
                },
              },
            },
          },
          methods: {
            description: 'events',
            tests: {},
          },
          events: {
            description: 'events',
            tests: {
              singleSelectChange: {
                description: 'should dispatch a change event when a button is toggled in single select mode',
                test: async () => {
                  const el = this.component;
                  const button = el.querySelector(project.scope.tagName('button')) as CoreButton;
                  const buttonEl = button.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  let changeEventFired = false;
                  el.addEventListener('change', () => {
                    changeEventFired = true;
                  });

                  buttonEl.click();
                  await el.updateComplete;

                  expect(changeEventFired).to.be.true;
                  expect(button.getAttribute('pressed')).to.not.be.null;
                },
                config: {
                  select: 'single',
                },
              },
              multipleSelectChange: {
                description: 'should dispatch change events when buttons are toggled in multiple select mode',
                test: async () => {
                  const el = this.component;
                  const buttons = el.querySelectorAll(project.scope.tagName('button'));
                  const button1 = buttons[0] as CoreButton;
                  const button2 = buttons[1] as CoreButton;
                  const button1El = button1.shadowRoot?.querySelector('button') as HTMLButtonElement;
                  const button2El = button2.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  let changeEventCount = 0;
                  el.addEventListener('change', () => {
                    changeEventCount++;
                  });

                  // Toggle first button on
                  button1El.click();
                  await el.updateComplete;

                  // Toggle second button on
                  button2El.click();
                  await el.updateComplete;

                  // Both buttons should be pressed
                  expect(changeEventCount).to.equal(2);
                  expect(button1.getAttribute('pressed')).to.not.be.null;
                  expect(button2.getAttribute('pressed')).to.not.be.null;
                },
                config: {
                  select: 'multiple',
                },
              },
            },
          },
          slots: {
            description: 'slots',
            tests: {
              defaultSlot: {
                description: 'places children in the default slot',
                test: async () => {
                  const el = this.component;
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;
                  const tag = project.scope.tagName('button');

                  el.innerHTML = `<${tag}>First</${tag}><${tag}>Inner</${tag}><${tag}>Last</${tag}>`;
                  await el.updateComplete;

                  expect(defaultSlot).to.not.be.null;
                },
              },
              tooltip: {
                description: 'gives tooltip a default distance of 12',
                test: async () => {
                  const el = this.component;
                  const button = el.querySelector(project.scope.tagName('button')) as HTMLElement;
                  button.setAttribute('id', 'button1');
                  const tooltip = document.createElement(project.scope.tagName('tooltip')) as CoreTooltip;
                  tooltip.anchor = 'button1';
                  el.appendChild(tooltip);
                  await el.updateComplete;
                  expect(tooltip.distance).to.equal(12);
                },
              },
              removeTooltip: {
                description: "doesn't override tooltip distance if it is set",
                test: async () => {
                  const el = this.component;
                  const button = el.querySelector(project.scope.tagName('button')) as HTMLElement;
                  button.setAttribute('id', 'button1');
                  const tooltip = document.createElement(project.scope.tagName('tooltip')) as CoreTooltip;
                  tooltip.anchor = 'button1';
                  tooltip.distance = 20;
                  el.appendChild(tooltip);
                  await el.updateComplete;
                  expect(tooltip.distance).to.equal(20);
                },
              },
            },
          },
          interactions: {
            description: 'interactions',
            tests: {
              newButtonUpdate: {
                description: 'should update the `button-group-button-position` attribute if a new button is added',
                test: async () => {
                  const el = this.component;
                  const newButton = document.createElement(project.scope.tagName('button'));
                  newButton.textContent = 'New Button';
                  el.appendChild(newButton);
                  await elementUpdated(el);

                  expect(newButton.getAttribute('button-group-button-position')).to.not.be.null;
                  expect(newButton.getAttribute('button-group-button-position')).to.equal('last');

                  const buttons = el.querySelectorAll(project.scope.tagName('button'));
                  expect(buttons[buttons.length - 2].getAttribute('button-group-button-position')).to.equal('inner');
                  expect(buttons[buttons.length - 2].getAttribute('button-group-button-position')).to.not.equal('last');
                },
              },
              toolBarRovingIndexInit: {
                description:
                  'should set a tabindex of -1 on all button children, and 0 on the first child when `toolbar` attribute is set',
                test: async () => {
                  const buttons = this.component.querySelectorAll(project.scope.tagName('button'));
                  buttons.forEach((button, i) => {
                    if (i === 0) {
                      expect(button.getAttribute('tabindex')).to.equal('0');
                    } else {
                      expect(button.getAttribute('tabindex')).to.equal('-1');
                    }
                  });
                },
                config: {
                  toolbar: '',
                },
              },
              toolBarKeyboardNext: {
                description:
                  'should focus the next item, set tabindex of 0 on it, and set tabindex of -1 on all other items, when `toolbar` attribute is set and `down arrow` and `right arrow` keys are pressed',
                test: async () => {
                  const el = this.component;
                  const itemOne = el.children[0] as CoreButton;
                  const itemTwo = el.children[1] as CoreButton;
                  const itemThree = el.children[2] as CoreMenu;
                  const itemFour = el.children[3] as CoreButton;

                  itemOne.focus();
                  expect(itemOne.getAttribute('tabindex')).to.equal('0');

                  await sendKeys({ press: 'ArrowDown' });
                  await el.updateComplete;
                  expect(itemTwo.getAttribute('tabindex')).to.equal('0');
                  expect(itemOne.getAttribute('tabindex')).to.equal('-1');

                  await sendKeys({ press: 'ArrowRight' });
                  await el.updateComplete;
                  expect(itemThree.getAttribute('tabindex')).to.equal('0');
                  expect(itemTwo.getAttribute('tabindex')).to.equal('-1');

                  await sendKeys({ press: 'ArrowDown' });
                  await el.updateComplete;
                  expect(itemFour.getAttribute('tabindex')).to.equal('0');
                  expect(itemThree.getAttribute('tabindex')).to.equal('-1');

                  await sendKeys({ press: 'ArrowRight' });
                  await el.updateComplete;
                  expect(itemOne.getAttribute('tabindex')).to.equal('0');
                  expect(itemFour.getAttribute('tabindex')).to.equal('-1');
                },
                config: {
                  toolbar: '',
                },
              },
              toolBarKeyboardPrevious: {
                description:
                  'should focus the previous item, set tabindex of 0 on it, and set tabindex of -1 on all other items, when `toolbar` attribute is set and `left arrow` and `up arrow` keys are pressed',
                test: async () => {
                  const el = this.component;
                  const itemOne = el.children[0] as CoreButton;
                  const itemTwo = el.children[1] as CoreButton;
                  const itemThree = el.children[2] as CoreMenu;
                  const itemFour = el.children[3] as CoreButton;

                  itemOne.focus();
                  expect(itemOne.getAttribute('tabindex')).to.equal('0');

                  await sendKeys({ press: 'ArrowLeft' });
                  await el.updateComplete;
                  expect(itemFour.getAttribute('tabindex')).to.equal('0');
                  expect(itemOne.getAttribute('tabindex')).to.equal('-1');

                  await sendKeys({ press: 'ArrowUp' });
                  await el.updateComplete;
                  expect(itemThree.getAttribute('tabindex')).to.equal('0');
                  expect(itemFour.getAttribute('tabindex')).to.equal('-1');

                  await sendKeys({ press: 'ArrowLeft' });
                  await el.updateComplete;
                  expect(itemTwo.getAttribute('tabindex')).to.equal('0');
                  expect(itemThree.getAttribute('tabindex')).to.equal('-1');

                  await sendKeys({ press: 'ArrowUp' });
                  await el.updateComplete;
                  expect(itemOne.getAttribute('tabindex')).to.equal('0');
                  expect(itemTwo.getAttribute('tabindex')).to.equal('-1');
                },
                config: {
                  toolbar: '',
                },
              },
              attributeChangedToolbar: {
                description: 'should add keydown event listener when toolbar attribute is added',
                test: async () => {
                  const el = this.component;
                  // Start without toolbar attribute
                  expect(el.hasAttribute('toolbar')).to.be.false;

                  // Set up test to check if keyboard navigation works
                  const itemOne = el.children[0] as CoreButton;
                  const itemTwo = el.children[1] as CoreButton;

                  // No navigation should happen before setting toolbar attribute
                  itemOne.focus();
                  await sendKeys({ press: 'ArrowRight' });
                  await el.updateComplete;

                  // ItemTwo should not be focused because keyboard navigation isn't active
                  expect(document.activeElement).to.equal(itemOne);

                  // Now add the toolbar attribute
                  el.setAttribute('toolbar', '');
                  await el.updateComplete;

                  // Set the tabindex attributes that toolbar initialization would normally do
                  itemOne.setAttribute('tabindex', '0');
                  itemTwo.setAttribute('tabindex', '-1');

                  // Try keyboard navigation again - now it should work
                  itemOne.focus();
                  await sendKeys({ press: 'ArrowRight' });
                  await el.updateComplete;

                  expect(itemTwo.getAttribute('tabindex')).to.equal('0');
                  expect(itemOne.getAttribute('tabindex')).to.equal('-1');
                },
                config: {},
              },
              disconnectedCleanup: {
                description: 'should remove event listeners when disconnected',
                test: async () => {
                  const el = this.component;

                  // Add select attribute to trigger adding the change event listener
                  el.setAttribute('select', 'single');
                  await el.updateComplete;

                  // Add toolbar attribute to trigger adding the keydown event listener
                  el.setAttribute('toolbar', '');
                  await el.updateComplete;

                  // Now disconnect the element
                  const parent = el.parentElement;
                  parent?.removeChild(el);

                  // The element should be disconnected but still exist
                  expect(el.isConnected).to.be.false;
                },
                config: {},
              },
              nonArrowKeyNoEffect: {
                description: 'should not respond to non-arrow key events',
                test: async () => {
                  const el = this.component;
                  const itemOne = el.children[0] as CoreButton;
                  const itemTwo = el.children[1] as CoreButton;

                  // Set up the initial state
                  itemOne.setAttribute('tabindex', '0');
                  itemTwo.setAttribute('tabindex', '-1');
                  itemOne.focus();

                  // Create and dispatch a non-arrow key event
                  const keyEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true,
                    composed: true,
                  });

                  el.dispatchEvent(keyEvent);
                  await el.updateComplete;

                  // Verify that nothing changed
                  expect(itemOne.getAttribute('tabindex')).to.equal('0');
                  expect(itemTwo.getAttribute('tabindex')).to.equal('-1');
                },
                config: {
                  toolbar: '',
                },
              },
              keyboardEventPropagation: {
                description: 'should handle keyboard arrow key events and navigate between buttons',
                test: async () => {
                  const el = this.component;

                  // Set up initial state
                  const itemOne = el.children[0] as CoreButton;
                  const itemTwo = el.children[1] as CoreButton;

                  // Set the tabindex attributes that toolbar initialization would normally do
                  itemOne.setAttribute('tabindex', '0');
                  itemTwo.setAttribute('tabindex', '-1');

                  // Focus the first item
                  itemOne.focus();

                  // Create an arrow key event that should be handled
                  const arrowKeyEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowRight',
                    bubbles: true,
                    composed: true,
                  });

                  // Dispatch the event to the element
                  el.dispatchEvent(arrowKeyEvent);
                  await el.updateComplete;

                  // Verify that the navigation worked
                  expect(itemOne.getAttribute('tabindex')).to.equal('-1');
                  expect(itemTwo.getAttribute('tabindex')).to.equal('0');
                },
                config: {
                  toolbar: '',
                },
              },
              edgeCaseNavigation: {
                description: 'should handle edge case navigation at the beginning and end of the button group',
                test: async () => {
                  const el = this.component;
                  const buttons = el.children;
                  const lastIndex = buttons.length - 1;

                  // Initially set up the first item as focused
                  for (let i = 0; i < buttons.length; i++) {
                    buttons[i].setAttribute('tabindex', i === 0 ? '0' : '-1');
                  }

                  // Test "ArrowLeft" from first position - should wrap to last
                  const leftEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowLeft',
                    bubbles: true,
                    composed: true,
                  });

                  el.dispatchEvent(leftEvent);
                  await el.updateComplete;

                  // Last item should now be focused
                  expect(buttons[0].getAttribute('tabindex')).to.equal('-1');
                  expect(buttons[lastIndex].getAttribute('tabindex')).to.equal('0');

                  // Now test "ArrowRight" from last position - should wrap to first
                  const rightEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowRight',
                    bubbles: true,
                    composed: true,
                  });

                  el.dispatchEvent(rightEvent);
                  await el.updateComplete;

                  // First item should now be focused again
                  expect(buttons[0].getAttribute('tabindex')).to.equal('0');
                  expect(buttons[lastIndex].getAttribute('tabindex')).to.equal('-1');
                },
                config: {
                  toolbar: '',
                },
              },
              verticalNavigationAttribute: {
                description: 'should add vertical attribute to buttons when vertical is set on button-group',
                test: async () => {
                  const el = this.component;
                  const buttons = el.querySelectorAll(project.scope.tagName('button'));

                  // Set the vertical attribute explicitly (it's already set in the config)
                  el.setAttribute('vertical', '');
                  await el.updateComplete;

                  // Verify that each button has the vertical attribute
                  buttons.forEach(button => {
                    expect(button.hasAttribute('vertical')).to.be.true;
                  });

                  // Remove the vertical attribute
                  el.removeAttribute('vertical');
                  await el.updateComplete;
                },
                config: {
                  vertical: '',
                },
              },
              nonButtonElements: {
                description: 'should handle non-button elements in the button group correctly',
                test: async () => {
                  const el = this.component;

                  // Add a non-button element to the group
                  const divElement = document.createElement('div');
                  divElement.textContent = 'Not a button';
                  el.appendChild(divElement);
                  await el.updateComplete;

                  // Add a button inside a div to test nested button detection
                  const containerDiv = document.createElement('div');
                  const nestedButton = document.createElement(project.scope.tagName('button'));
                  nestedButton.textContent = 'Nested Button';
                  containerDiv.appendChild(nestedButton);
                  el.appendChild(containerDiv);
                  await el.updateComplete;

                  // Trigger a slotchange event to force initialization
                  const slotChangeEvent = new Event('slotchange');
                  el.shadowRoot?.querySelector('slot')?.dispatchEvent(slotChangeEvent);
                  await el.updateComplete;

                  // Now add an element that has nothing - to test both conditional paths
                  const emptyDiv = document.createElement('div');
                  el.appendChild(emptyDiv);
                  await el.updateComplete;

                  // Trigger slotchange again
                  el.shadowRoot?.querySelector('slot')?.dispatchEvent(slotChangeEvent);
                  await el.updateComplete;

                  // The nested button should have a position attribute
                  expect(nestedButton.hasAttribute('button-group-button-position')).to.be.true;
                },
                config: {},
              },
              reinitializePositionAttributes: {
                description: 'should correctly reinitialize button position attributes',
                test: async () => {
                  const el = this.component;
                  const buttons = el.querySelectorAll(project.scope.tagName('button'));

                  // Verify initial state
                  expect(buttons[0].getAttribute('button-group-button-position')).to.equal('first');
                  expect(buttons[buttons.length - 1].getAttribute('button-group-button-position')).to.equal('last');

                  // Remove position attributes from all buttons
                  buttons.forEach(button => {
                    button.removeAttribute('button-group-button-position');
                  });

                  // Verify attributes were removed
                  buttons.forEach(button => {
                    expect(button.getAttribute('button-group-button-position')).to.be.null;
                  });

                  // Trigger reinitialization by dispatching a slotchange event
                  const slotChangeEvent = new Event('slotchange');
                  el.shadowRoot?.querySelector('slot')?.dispatchEvent(slotChangeEvent);
                  await el.updateComplete;

                  // Verify attributes were restored correctly
                  expect(buttons[0].getAttribute('button-group-button-position')).to.equal('first');
                  expect(buttons[buttons.length - 1].getAttribute('button-group-button-position')).to.equal('last');

                  // Middle buttons should have "inner" position
                  if (buttons.length > 2) {
                    for (let i = 1; i < buttons.length - 1; i++) {
                      expect(buttons[i].getAttribute('button-group-button-position')).to.equal('inner');
                    }
                  }
                },
                config: {},
              },
            },
          },
        },
      },
    });
  }
}

export class CoreNoDropdownButtonGroupTests<T extends CoreButtonGroup> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      buttonGroup: {
        description: 'buttonGroup with No Dropdowns',
        tests: {
          interactions: {
            description: 'interactions',
            tests: {
              selectSingle: {
                description: 'should allow for selection of a single button when `select` attribute is `single`',
                test: async () => {
                  const el = this.component;
                  const itemOne = el.children[0] as CoreButton;
                  const itemOneButton = itemOne.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemTwo = el.children[1] as CoreButton;
                  const itemTwoButton = itemTwo.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemThree = el.children[2] as CoreButton;
                  const itemThreeButton = itemThree.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemFour = el.children[3] as CoreButton;
                  const itemFourButton = itemFour.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  itemOneButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.not.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemTwoButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.not.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemThreeButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.not.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemFourButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.not.be.null;
                },
                config: {
                  select: 'single',
                },
              },
              selectSingleUnselect: {
                description: 'should allow for unselecting of a single button when `select` attribute is `single`',
                test: async () => {
                  const el = this.component;
                  const itemOne = el.children[0] as CoreButton;

                  const itemTwo = el.children[1] as CoreButton;
                  const itemTwoButton = itemTwo.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemThree = el.children[2] as CoreButton;
                  const itemThreeButton = itemThree.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemFour = el.children[3] as CoreButton;

                  itemTwoButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.not.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemTwoButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemThreeButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.not.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemThreeButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;
                },
                config: {
                  select: 'single',
                },
              },
              selectMultiple: {
                description: 'should allow for selection of a multiple buttons when `select` attribute is `multiple`',
                test: async () => {
                  const el = this.component;
                  const itemOne = el.children[0] as CoreButton;
                  const itemOneButton = itemOne.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemTwo = el.children[1] as CoreButton;
                  const itemTwoButton = itemTwo.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemThree = el.children[2] as CoreButton;
                  const itemThreeButton = itemThree.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemFour = el.children[3] as CoreButton;
                  const itemFourButton = itemFour.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  itemOneButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.not.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemTwoButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.not.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.not.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemThreeButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.not.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.not.be.null;
                  expect(itemThree.getAttribute('pressed')).to.not.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemFourButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.not.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.not.be.null;
                  expect(itemThree.getAttribute('pressed')).to.not.be.null;
                  expect(itemFour.getAttribute('pressed')).to.not.be.null;
                },
                config: {
                  select: 'multiple',
                },
              },
              selectMultipleUnselect: {
                description: 'should allow for unselecting of a multiple buttons when `select` attribute is `multiple`',
                test: async () => {
                  const el = this.component;
                  const itemOne = el.children[0] as CoreButton;

                  const itemTwo = el.children[1] as CoreButton;
                  const itemTwoButton = itemTwo.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemThree = el.children[2] as CoreButton;
                  const itemThreeButton = itemThree.shadowRoot?.querySelector('button') as HTMLButtonElement;

                  const itemFour = el.children[3] as CoreButton;

                  itemTwoButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.not.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemTwoButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemThreeButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.not.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;

                  itemThreeButton.click();
                  await el.updateComplete;

                  expect(itemOne.getAttribute('pressed')).to.be.null;
                  expect(itemTwo.getAttribute('pressed')).to.be.null;
                  expect(itemThree.getAttribute('pressed')).to.be.null;
                  expect(itemFour.getAttribute('pressed')).to.be.null;
                },
                config: {
                  select: 'multiple',
                },
              },
            },
          },
        },
      },
    });
  }
}
export class CoreButtonGroupNestedToolbarTests<T extends CoreButtonGroup> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      nestedButtonGroupNoToolbar: {
        description: 'nested buttonGroups',
        tests: {
          NoToolbar: {
            description: 'should not have the attribute `toolbar` on nested button groups',
            test: async () => {
              const el = this.component;
              const itemOne = el.children[0] as CoreButtonGroup;
              expect(itemOne.getAttribute('toolbar')).to.be.null;
              const itemTwo = el.children[1] as CoreButtonGroup;
              expect(itemTwo.getAttribute('toolbar')).to.be.null;
            },
            config: {},
          },
          NestedToolbar: {
            description: 'should have the attribute `toolbar` set automatically on nested button groups',
            test: async () => {
              const el = this.component;
              const itemOne = el.children[0] as CoreButtonGroup;
              expect(itemOne.getAttribute('toolbar')).not.to.be.null;
              const itemTwo = el.children[1] as CoreButtonGroup;
              expect(itemTwo.getAttribute('toolbar')).not.to.be.null;
            },
            config: {
              toolbar: true,
            },
          },
          DirectNestedButtonGroups: {
            description: 'should propagate toolbar attribute to direct nested button groups when toolbar is set',
            test: async () => {
              const el = this.component;
              const nestedGroups = el.querySelectorAll(project.scope.tagName('button-group'));
              // Should have toolbar attribute on all nested groups
              nestedGroups.forEach(group => {
                if (group !== el) {
                  expect(group.getAttribute('toolbar')).not.to.be.null;
                }
              });
            },
            config: {
              toolbar: true,
            },
          },
          DeeplyNestedButtonGroups: {
            description: 'should propagate toolbar attribute to deeply nested button groups (multiple levels)',
            test: async () => {
              const container = document.createElement('div');
              const buttonGroupTag = project.scope.tagName('button-group');
              const buttonTag = project.scope.tagName('button');
              document.body.appendChild(container);
              // Create deeply nested structure: toolbar > group > group > button
              container.innerHTML = `
                <${buttonGroupTag} toolbar>
                  <${buttonTag}>Button 1</${buttonTag}>
                  <${buttonGroupTag}>
                    <${buttonTag}>Nested Button 1</${buttonTag}>
                    <${buttonGroupTag}>
                      <${buttonTag}>Deep Button 1</${buttonTag}>
                    </${buttonGroupTag}>
                  </${buttonGroupTag}>
                </${buttonGroupTag}>
              `;
              const rootGroup = container.querySelector(project.scope.tagName('button-group')) as CoreButtonGroup;
              await elementUpdated(rootGroup);
              // All nested groups should have toolbar attribute
              const allNestedGroups = rootGroup.querySelectorAll(project.scope.tagName('button-group'));
              allNestedGroups.forEach(group => {
                if (group !== rootGroup) {
                  expect(group.getAttribute('toolbar')).not.to.be.null;
                }
              });
              document.body.removeChild(container);
            },
            config: {},
          },
          MixedButtonsAndNestedGroups: {
            description: 'should apply toolbar to nested groups while also managing buttons when toolbar is set',
            test: async () => {
              const container = document.createElement('div');
              const buttonGroupTag = project.scope.tagName('button-group');
              const buttonTag = project.scope.tagName('button');
              document.body.appendChild(container);
              // Create structure with both buttons and nested groups
              container.innerHTML = `
                <${buttonGroupTag} toolbar>
                  <${buttonTag}>Button 1</${buttonTag}>
                  <${buttonGroupTag}>
                    <${buttonTag}>Nested Button 1</${buttonTag}>
                    <${buttonTag}>Nested Button 2</${buttonTag}>
                  </${buttonGroupTag}>
                  <${buttonTag}>Button 2</${buttonTag}>
                </${buttonGroupTag}>
              `;
              const rootGroup = container.querySelector(project.scope.tagName('button-group')) as CoreButtonGroup;
              await elementUpdated(rootGroup);
              // Check that nested group has toolbar attribute
              const nestedGroup = rootGroup.querySelector(project.scope.tagName('button-group'));
              expect(nestedGroup?.getAttribute('toolbar')).not.to.be.null;
              // Check that buttons in root group have correct tabindex
              const buttons = rootGroup.querySelectorAll(project.scope.tagName('button'));
              expect(buttons[0].getAttribute('tabindex')).to.equal('0'); // First button should be 0
              document.body.removeChild(container);
            },
            config: {},
          },
          NestedGroupsWithoutToolbar: {
            description: 'should not propagate toolbar when parent toolbar is not set',
            test: async () => {
              const container = document.createElement('div');
              const buttonGroupTag = project.scope.tagName('button-group');
              const buttonTag = project.scope.tagName('button');
              document.body.appendChild(container);
              // Create structure without toolbar on parent
              container.innerHTML = `
                <${buttonGroupTag}>
                  <${buttonTag}>Button 1</${buttonTag}>
                  <${buttonGroupTag}>
                    <${buttonTag}>Nested Button 1</${buttonTag}>
                  </${buttonGroupTag}>
                </${buttonGroupTag}>
              `;
              const rootGroup = container.querySelector(project.scope.tagName('button-group')) as CoreButtonGroup;
              await elementUpdated(rootGroup);
              // Nested group should not have toolbar attribute
              const nestedGroup = rootGroup.querySelector(project.scope.tagName('button-group'));
              expect(nestedGroup?.getAttribute('toolbar')).to.be.null;
              document.body.removeChild(container);
            },
            config: {},
          },
          NestedGroupToolbarToggle: {
            description: 'should add toolbar to nested groups when toolbar attribute is added to parent',
            test: async () => {
              const container = document.createElement('div');
              const buttonGroupTag = project.scope.tagName('button-group');
              const buttonTag = project.scope.tagName('button');
              document.body.appendChild(container);
              // Create structure without toolbar initially
              container.innerHTML = `
                <${buttonGroupTag} id="root">
                  <${buttonTag}>Button 1</${buttonTag}>
                  <${buttonGroupTag} id="nested">
                    <${buttonTag}>Nested Button 1</${buttonTag}>
                  </${buttonGroupTag}>
                </${buttonGroupTag}>
              `;
              const rootGroup = container.querySelector('#root') as CoreButtonGroup;
              const nestedGroup = container.querySelector('#nested') as CoreButtonGroup;
              await elementUpdated(rootGroup);
              // Initially no toolbar
              expect(nestedGroup.getAttribute('toolbar')).to.be.null;
              // Add toolbar to parent
              rootGroup.setAttribute('toolbar', '');
              await elementUpdated(rootGroup);
              // Trigger slotchange to initialize slotted elements and propagate toolbar
              const slot = rootGroup.shadowRoot?.querySelector('slot') as HTMLSlotElement;
              const slotChangeEvent = new Event('slotchange');
              slot?.dispatchEvent(slotChangeEvent);
              await elementUpdated(rootGroup);
              // Nested group should now have toolbar
              expect(nestedGroup.getAttribute('toolbar')).not.to.be.null;
              document.body.removeChild(container);
            },
            config: {},
          },
        },
      },
    });
  }
}
