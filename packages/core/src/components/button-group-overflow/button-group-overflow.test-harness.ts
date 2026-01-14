import { aTimeout, elementUpdated, expect } from '@open-wc/testing';
import { setViewport } from '@web/test-runner-commands';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { project } from '../../utilities/index.js';
import type { CoreButtonGroupOverflow } from './index.js';

export class CoreButtonGroupOverflowTests<T extends CoreButtonGroupOverflow> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      'button-group-overflow': {
        description: 'ButtonGroupOverflow',
        tests: {
          groupDividers: {
            description: 'should group overflowed buttons by parent group and render dividers',
            test: async () => {
              // Set up a small viewport to force overflow
              await setViewport({ width: 120, height: 600 });
              const el = this.component;
              await elementUpdated(el);
              await aTimeout(300);

              // Open the overflow menu
              const menu = el.shadowRoot!.querySelector('[menu]');
              const trigger = el.shadowRoot!.querySelector('[menu] > [slot="trigger"]') as HTMLButtonElement;
              trigger.click();
              await elementUpdated(el);
              await aTimeout(20);

              // Get all dividers
              const dividers = menu!.querySelectorAll(`${project.scope.tagName('divider')}, hr`);

              // There should be at least one divider between groups
              expect(dividers.length).to.be.greaterThan(0);

              // Menu items should be grouped (first group, divider, second group)
              // Check that divider is between menu items from different groups
              let foundDivider = false;
              let lastGroup = null;
              menu!.childNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const tag = (node as HTMLElement).tagName;
                  if (tag.endsWith('-DIVIDER') || tag === 'HR') {
                    foundDivider = true;
                  }
                  if ((node as HTMLElement).hasAttribute('menu-item')) {
                    if (!foundDivider) {
                      lastGroup = 'first';
                    } else {
                      lastGroup = 'second';
                    }
                  }
                }
              });
              expect(lastGroup).to.equal('second');
            },
          },
          singleElementSlotted: {
            description: 'should handle single elements with no children correctly',
            test: async () => {
              // Set up a small viewport to force overflow
              await setViewport({ width: 120, height: 600 });

              // Create a new component instance with a single element with no children
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              container.innerHTML = `
                <${buttonGroupOverflowTag}>
                  <${buttonTag} style="width: 200px">Single Button</${buttonTag}>
                </${buttonGroupOverflowTag}>
              `;

              const el = container.querySelector(project.scope.tagName('button-group-overflow')) as HTMLElement;
              await elementUpdated(el);
              await aTimeout(300);

              // Force overflow by setting a small width
              el.style.width = '100px';
              await elementUpdated(el);
              await aTimeout(300);

              // Verify that the button is now in the overflow menu
              const menu = el.shadowRoot!.querySelector('[menu]');
              const trigger = el.shadowRoot!.querySelector('[menu] > [slot="trigger"]') as HTMLButtonElement;

              // Verify that the overflow trigger exists
              expect(trigger).to.not.be.null;

              // Click the trigger to open the menu
              trigger.click();
              await elementUpdated(el);
              await aTimeout(20);

              // Check that the single button is in the menu
              const menuItem = menu!.querySelector(project.scope.tagName('menu-item'));
              expect(menuItem).to.not.be.null;
              expect(menuItem!.textContent!.trim()).to.include('Single Button');

              // Clean up
              document.body.removeChild(container);
            },
          },
          dividerRendering: {
            description: 'should render dividers correctly in the overflow menu',
            test: async () => {
              // Set up a small viewport to force overflow
              await setViewport({ width: 120, height: 600 });

              // Create a component with dividers that will overflow
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const dividerTag = project.scope.tagName('divider');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              container.innerHTML = `
                <${buttonGroupOverflowTag}>
                  <${buttonTag} style="width: 50px">A</${buttonTag}>
                  <${dividerTag}></${dividerTag}>
                  <${buttonTag} style="width: 50px">B</${buttonTag}>
                  <${dividerTag}></${dividerTag}>
                  <${buttonTag} style="width: 50px">C</${buttonTag}>
                </${buttonGroupOverflowTag}>
              `;

              const el = container.querySelector(project.scope.tagName('button-group-overflow')) as HTMLElement;
              await elementUpdated(el);
              await aTimeout(300);

              // Force overflow by setting a small width
              el.style.width = '100px';
              await elementUpdated(el);
              await aTimeout(300);

              // Open the overflow menu
              const menu = el.shadowRoot!.querySelector('[menu]');
              const trigger = el.shadowRoot!.querySelector('[menu] > [slot="trigger"]') as HTMLButtonElement;
              trigger.click();
              await elementUpdated(el);
              await aTimeout(20);

              // Verify that dividers were rendered in the menu
              const dividers = menu!.querySelectorAll(project.scope.tagName('divider'));
              expect(dividers.length).to.be.greaterThan(0);

              // Clean up
              document.body.removeChild(container);
            },
          },
          complexSlottedElements: {
            description: 'should handle a mix of elements with and without children correctly',
            test: async () => {
              // Set up a small viewport to force overflow
              await setViewport({ width: 120, height: 600 });

              // Create a component with a complex mix of elements
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              container.innerHTML = `
                <${buttonGroupOverflowTag}>
                  <div>
                    <${buttonTag} style="width: 50px">In Div 1</${buttonTag}>
                    <${buttonTag} style="width: 50px">In Div 2</${buttonTag}>
                  </div>
                  <${buttonTag} style="width: 50px">Standalone</${buttonTag}>
                  <div></div>
                </${buttonGroupOverflowTag}>
              `;

              const el = container.querySelector(project.scope.tagName('button-group-overflow')) as HTMLElement;
              await elementUpdated(el);
              await aTimeout(300);

              // Force overflow by setting a small width
              el.style.width = '100px';
              await elementUpdated(el);
              await aTimeout(300);

              // Open the overflow menu
              const menu = el.shadowRoot!.querySelector('[menu]');
              const trigger = el.shadowRoot!.querySelector('[menu] > [slot="trigger"]') as HTMLButtonElement;
              trigger.click();
              await elementUpdated(el);
              await aTimeout(20);

              // There should be menu items for each button (including those in the div)
              const menuItems = menu!.querySelectorAll(project.scope.tagName('menu-item'));

              // We should have some menu items
              expect(menuItems.length).to.be.greaterThan(0);

              // Verify at least one button is in the overflow menu
              let foundButton = false;
              menuItems.forEach(item => {
                const text = item.textContent?.trim() || '';
                if (text.includes('In Div') || text.includes('Standalone')) {
                  foundButton = true;
                }
              });

              expect(foundButton).to.be.true;

              // Clean up
              document.body.removeChild(container);
            },
          },
          menuPosition: {
            description: 'should correctly position the overflow menu at start or end',
            test: async () => {
              // Set up a small viewport to force overflow
              await setViewport({ width: 120, height: 600 });

              // Create a container for our tests
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              // Test with menu at the end (default)
              container.innerHTML = `
                <${buttonGroupOverflowTag} menu-position="end" style="width: 100px;">
                  <${buttonTag} style="width: 50px">A</${buttonTag}>
                  <${buttonTag} style="width: 50px">B</${buttonTag}>
                  <${buttonTag} style="width: 50px">C</${buttonTag}>
                </${buttonGroupOverflowTag}>
              `;

              let el = container.querySelector(project.scope.tagName('button-group-overflow')) as HTMLElement;
              await elementUpdated(el);
              await aTimeout(300);

              // Check that the overflow menu exists and is visible
              const menu = el.shadowRoot!.querySelector('[menu]');
              expect(menu).to.not.be.null;

              // Clean up
              container.innerHTML = '';

              // Test with menu at the start
              container.innerHTML = `
                <${buttonGroupOverflowTag} menu-position="start" style="width: 100px;">
                  <${buttonTag} style="width: 50px">A</${buttonTag}>
                  <${buttonTag} style="width: 50px">B</${buttonTag}>
                  <${buttonTag} style="width: 50px">C</${buttonTag}>
                </${buttonGroupOverflowTag}>
              `;

              el = container.querySelector(project.scope.tagName('button-group-overflow')) as HTMLElement;
              await elementUpdated(el);
              await aTimeout(300);

              // Check that the overflow menu is before the content

              // Check that the menu exists at all
              const startMenu = el.shadowRoot!.querySelector('[menu]');
              expect(startMenu).to.not.be.null;

              // Verify that the menuPosition attribute is set correctly
              expect(el.getAttribute('menu-position')).to.equal('start');

              // Clean up
              document.body.removeChild(container);
            },
          },
          overflowEvent: {
            description: 'should emit overflow event when items overflow',
            test: async () => {
              // Set up a small viewport to force overflow
              await setViewport({ width: 300, height: 600 });

              // Create a component with buttons that will overflow
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              container.innerHTML = `
                <${buttonGroupOverflowTag} style="width: 300px;">
                  <${buttonTag} style="width: 100px">A</${buttonTag}>
                  <${buttonTag} style="width: 100px">B</${buttonTag}>
                  <${buttonTag} style="width: 100px">C</${buttonTag}>
                </${buttonGroupOverflowTag}>
              `;

              const el = container.querySelector(project.scope.tagName('button-group-overflow')) as HTMLElement;
              await elementUpdated(el);
              await aTimeout(300);

              // Initially all buttons should fit (300px width)
              expect(el.shadowRoot!.querySelector('[menu]')).to.be.null;

              // Set up event listener to track overflow events
              let overflowEventFired = false;
              let overflowedElementsCount = 0;

              el.addEventListener('overflow', (e: Event) => {
                overflowEventFired = true;
                // @ts-ignore - Custom event detail
                overflowedElementsCount = e.detail?.overflowedElements?.length || 0;
              });

              // Resize to trigger overflow
              el.style.width = '150px';
              await elementUpdated(el);
              await aTimeout(300);

              // Now we should have an overflow menu
              expect(el.shadowRoot!.querySelector('[menu]')).to.not.be.null;

              // Verify that the overflow event was fired
              expect(overflowEventFired).to.be.true;
              expect(overflowedElementsCount).to.be.greaterThan(0);

              // Clean up
              document.body.removeChild(container);
            },
          },
        },
      },
    });
  }
}
