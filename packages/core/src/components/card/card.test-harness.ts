import { expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { CoreCard } from './index.js';

export class CoreCardTests<T extends CoreCard> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      switch: {
        description: 'card',
        tests: {
          // property tests
          properties: {
            description: 'properties',
            tests: {
              childrenInSlot: {
                description: 'places children in the default slot',
                test: async () => {
                  const el = this.component;
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
                  expect(defaultSlot).to.not.be.undefined;
                },
              },
              headingProperty: {
                description: 'renders heading property in heading slot fallback',
                test: async () => {
                  const el = this.component;
                  el.heading = 'Test Heading';
                  await el.updateComplete;
                  const heading = el.shadowRoot?.querySelector('h3[part="card-heading"]');
                  expect(heading?.textContent).to.include('Test Heading');
                  expect(heading).to.be.visible;
                },
              },
              subheadingProperty: {
                description: 'renders subheading property in subheading slot fallback',
                test: async () => {
                  const el = this.component;
                  el.subheading = 'Test Subheading';
                  await el.updateComplete;
                  const subheading = el.shadowRoot?.querySelector('h4[part="card-subheading"]');
                  expect(subheading?.textContent).to.include('Test Subheading');
                  expect(subheading).to.be.visible;
                },
              },
              mediaPositionAttribute: {
                description: 'reflects media-position attribute',
                test: async () => {
                  const el = this.component;
                  el.mediaPosition = 'bottom';
                  await el.updateComplete;
                  expect(el.getAttribute('media-position')).to.equal('bottom');
                },
              },
            },
          },
          slots: {
            description: 'slots',
            tests: {
              mediaSlot: {
                description: 'renders media slot when slotted',
                test: async () => {
                  const el = this.component;
                  const media = document.createElement('div');
                  media.setAttribute('slot', 'media');
                  media.textContent = 'Media Content';
                  el.appendChild(media);
                  await el.updateComplete;
                  const slot = el.shadowRoot?.querySelector('slot[name="media"]') as HTMLSlotElement | null;
                  expect(slot).to.not.be.undefined;
                  expect(slot?.assignedNodes().length).to.be.greaterThan(0);
                },
              },
              headingSlot: {
                description: 'renders heading slot when slotted',
                test: async () => {
                  const el = this.component;
                  const heading = document.createElement('span');
                  heading.setAttribute('slot', 'heading');
                  heading.textContent = 'Slotted Heading';
                  el.appendChild(heading);
                  await el.updateComplete;
                  const slot = el.shadowRoot?.querySelector('slot[name="heading"]') as HTMLSlotElement | null;
                  expect(slot).to.not.be.undefined;
                  expect(slot?.assignedNodes().length).to.be.greaterThan(0);
                },
              },
              subheadingSlot: {
                description: 'renders subheading slot when slotted',
                test: async () => {
                  const el = this.component;
                  const subheading = document.createElement('span');
                  subheading.setAttribute('slot', 'subheading');
                  subheading.textContent = 'Slotted Subheading';
                  el.appendChild(subheading);
                  await el.updateComplete;
                  const slot = el.shadowRoot?.querySelector('slot[name="subheading"]') as HTMLSlotElement | null;
                  expect(slot).to.not.be.undefined;
                  expect(slot?.assignedNodes().length).to.be.greaterThan(0);
                },
              },
              footerSlot: {
                description: 'renders footer slot when slotted',
                test: async () => {
                  const el = this.component;
                  const footer = document.createElement('span');
                  footer.setAttribute('slot', 'footer');
                  footer.textContent = 'Slotted Footer';
                  el.appendChild(footer);
                  await el.updateComplete;
                  const slot = el.shadowRoot?.querySelector('slot[name="footer"]') as HTMLSlotElement | null;
                  expect(slot).to.not.be.undefined;
                  expect(slot?.assignedNodes().length).to.be.greaterThan(0);
                },
              },
            },
          },
          rendering: {
            description: 'rendering',
            tests: {
              rendersBaseStructure: {
                description: 'renders base structure with all parts',
                test: async () => {
                  const el = this.component;
                  await el.updateComplete;
                  const base = el.shadowRoot?.querySelector('article.base[part="card-base"]');
                  const content = el.shadowRoot?.querySelector('div.card-content[part="card-content"]');
                  const header = el.shadowRoot?.querySelector('header.header[part="card-header"]');
                  const footer = el.shadowRoot?.querySelector('footer.footer[part="card-footer"]');
                  expect(base).to.exist;
                  expect(content).to.exist;
                  expect(header).to.exist;
                  expect(footer).to.exist;
                },
              },
            },
          },
        },
      },
    });
  }
}
