import { aTimeout, elementUpdated, expect } from '@open-wc/testing';
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
              const el = this.component;
              // Use CSS width instead of setViewport to force overflow
              el.style.width = '120px';
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
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              try {
                container.innerHTML = `
                  <${buttonGroupOverflowTag} style="width: 100px;">
                    <${buttonTag} style="width: 200px">Single Button</${buttonTag}>
                  </${buttonGroupOverflowTag}>
                `;

                const el = container.querySelector(buttonGroupOverflowTag) as HTMLElement;
                await elementUpdated(el);
                await aTimeout(300);

                const menu = el.shadowRoot!.querySelector('[menu]');
                const trigger = el.shadowRoot!.querySelector('[menu] > [slot="trigger"]') as HTMLButtonElement;

                expect(trigger).to.not.be.null;

                trigger.click();
                await elementUpdated(el);
                await aTimeout(20);

                const menuItem = menu!.querySelector(project.scope.tagName('menu-item'));
                expect(menuItem).to.not.be.null;
                expect(menuItem!.textContent!.trim()).to.include('Single Button');
              } finally {
                container.remove();
              }
            },
          },
          dividerRendering: {
            description: 'should render dividers correctly in the overflow menu',
            test: async () => {
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const dividerTag = project.scope.tagName('divider');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              try {
                container.innerHTML = `
                  <${buttonGroupOverflowTag} style="width: 100px;">
                    <${buttonTag} style="width: 50px">A</${buttonTag}>
                    <${dividerTag}></${dividerTag}>
                    <${buttonTag} style="width: 50px">B</${buttonTag}>
                    <${dividerTag}></${dividerTag}>
                    <${buttonTag} style="width: 50px">C</${buttonTag}>
                  </${buttonGroupOverflowTag}>
                `;

                const el = container.querySelector(buttonGroupOverflowTag) as HTMLElement;
                await elementUpdated(el);
                await aTimeout(300);

                const menu = el.shadowRoot!.querySelector('[menu]');
                const trigger = el.shadowRoot!.querySelector('[menu] > [slot="trigger"]') as HTMLButtonElement;
                trigger.click();
                await elementUpdated(el);
                await aTimeout(20);

                const dividers = menu!.querySelectorAll(project.scope.tagName('divider'));
                expect(dividers.length).to.be.greaterThan(0);
              } finally {
                container.remove();
              }
            },
          },
          complexSlottedElements: {
            description: 'should handle a mix of elements with and without children correctly',
            test: async () => {
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              try {
                container.innerHTML = `
                  <${buttonGroupOverflowTag} style="width: 100px;">
                    <div>
                      <${buttonTag} style="width: 50px">In Div 1</${buttonTag}>
                      <${buttonTag} style="width: 50px">In Div 2</${buttonTag}>
                    </div>
                    <${buttonTag} style="width: 50px">Standalone</${buttonTag}>
                    <div></div>
                  </${buttonGroupOverflowTag}>
                `;

                const el = container.querySelector(buttonGroupOverflowTag) as HTMLElement;
                await elementUpdated(el);
                await aTimeout(300);

                const menu = el.shadowRoot!.querySelector('[menu]');
                const trigger = el.shadowRoot!.querySelector('[menu] > [slot="trigger"]') as HTMLButtonElement;
                trigger.click();
                await elementUpdated(el);
                await aTimeout(20);

                const menuItems = menu!.querySelectorAll(project.scope.tagName('menu-item'));
                expect(menuItems.length).to.be.greaterThan(0);

                let foundButton = false;
                menuItems.forEach(item => {
                  const text = item.textContent?.trim() || '';
                  if (text.includes('In Div') || text.includes('Standalone')) {
                    foundButton = true;
                  }
                });

                expect(foundButton).to.be.true;
              } finally {
                container.remove();
              }
            },
          },
          menuPosition: {
            description: 'should correctly position the overflow menu at start or end',
            test: async () => {
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              try {
                container.innerHTML = `
                  <${buttonGroupOverflowTag} menu-position="end" style="width: 100px;">
                    <${buttonTag} style="width: 50px">A</${buttonTag}>
                    <${buttonTag} style="width: 50px">B</${buttonTag}>
                    <${buttonTag} style="width: 50px">C</${buttonTag}>
                  </${buttonGroupOverflowTag}>
                `;

                let el = container.querySelector(buttonGroupOverflowTag) as HTMLElement;
                await elementUpdated(el);
                await aTimeout(300);

                const menu = el.shadowRoot!.querySelector('[menu]');
                expect(menu).to.not.be.null;

                container.innerHTML = '';

                container.innerHTML = `
                  <${buttonGroupOverflowTag} menu-position="start" style="width: 100px;">
                    <${buttonTag} style="width: 50px">A</${buttonTag}>
                    <${buttonTag} style="width: 50px">B</${buttonTag}>
                    <${buttonTag} style="width: 50px">C</${buttonTag}>
                  </${buttonGroupOverflowTag}>
                `;

                el = container.querySelector(buttonGroupOverflowTag) as HTMLElement;
                await elementUpdated(el);
                await aTimeout(300);

                const startMenu = el.shadowRoot!.querySelector('[menu]');
                expect(startMenu).to.not.be.null;
                expect(el.getAttribute('menu-position')).to.equal('start');
              } finally {
                container.remove();
              }
            },
          },
          overflowEvent: {
            description: 'should emit overflow event when items overflow',
            test: async () => {
              const container = document.createElement('div');
              const buttonTag = project.scope.tagName('button');
              const buttonGroupOverflowTag = project.scope.tagName('button-group-overflow');
              document.body.appendChild(container);

              try {
                container.innerHTML = `
                  <${buttonGroupOverflowTag} style="width: 350px;">
                    <${buttonTag} style="width: 100px">A</${buttonTag}>
                    <${buttonTag} style="width: 100px">B</${buttonTag}>
                    <${buttonTag} style="width: 100px">C</${buttonTag}>
                  </${buttonGroupOverflowTag}>
                `;

                const el = container.querySelector(buttonGroupOverflowTag) as HTMLElement;
                await elementUpdated(el);
                await aTimeout(300);

                // Initially all buttons should fit
                expect(el.shadowRoot!.querySelector('[menu]')).to.be.null;

                let overflowEventFired = false;
                let overflowedElementsCount = 0;

                el.addEventListener('overflow', (e: Event) => {
                  overflowEventFired = true;
                  overflowedElementsCount = (e as CustomEvent).detail?.overflowedElements?.length || 0;
                });

                // Shrink to trigger overflow
                el.style.width = '150px';
                await elementUpdated(el);
                await aTimeout(300);

                expect(el.shadowRoot!.querySelector('[menu]')).to.not.be.null;
                expect(overflowEventFired).to.be.true;
                expect(overflowedElementsCount).to.be.greaterThan(0);
              } finally {
                container.remove();
              }
            },
          },
        },
      },
    });
  }
}
