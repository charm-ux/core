import { elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreAvatar } from './index.js';

export class CoreAvatarTests<T extends CoreAvatar> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      avatar: {
        description: 'avatar',
        tests: {
          slots: {
            description: 'slots',
            tests: {
              accessibleImg: {
                description: 'should be accessible with img',
                test: async () => {
                  const el = this.component;
                  const labelValue = 'User Label';

                  el.label = labelValue;
                  el.image = 'https://via.placeholder.com/32x32';
                  await elementUpdated(el!);
                  await expect(el).to.be.accessible();
                },
              },
              accessibleInitials: {
                description: 'should be accessible with initials',
                test: async () => {
                  const el = this.component;
                  const labelValue = 'User Label';

                  el.label = labelValue;
                  el.initials = 'JD';
                  await elementUpdated(el);
                  await expect(el).to.be.accessible();
                },
              },
              defaultSlot: {
                description: 'places children in the default slot',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = 'AB';
                  await elementUpdated(el);
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(initials)') as HTMLSlotElement;
                  expect(defaultSlot).to.not.be.null;
                },
              },
              defaultSlotWithNameContent: {
                description: 'override default slot when initials property is set',
                test: async () => {
                  const el = this.component;
                  const initialsValue = 'JD';
                  el.initials = initialsValue;

                  const defaultSlotContent = 'Default Content';
                  el.innerHTML = `<div slot="default">${defaultSlotContent}</div>`;
                  await elementUpdated(el);

                  const initialsElement = el.shadowRoot?.querySelector('[part="avatar-initials"]') as HTMLDivElement;

                  expect(initialsElement).to.not.be.null;
                  expect(initialsElement.textContent?.trim()).to.equal(initialsValue);
                },
              },
              imageSlot: {
                description: 'renders image slot with content and hides initials',
                test: async () => {
                  const el = this.component;
                  const imageUrl = 'https://via.placeholder.com/32x32';
                  const initialsValue = 'AB';

                  el.innerHTML = `<img slot="image" src="${imageUrl}" alt="User Avatar" />`;
                  el.initials = initialsValue;
                  await elementUpdated(el);

                  const imageSlot = el.querySelector('[slot="image"]') as HTMLImageElement;
                  expect(imageSlot).to.not.be.null;
                  expect(imageSlot.src).to.equal(imageUrl);

                  const initialsElement = el.shadowRoot?.querySelector('[part="avatar-initials"]');
                  expect(initialsElement).to.be.null;
                },
              },
              statusIndicator: {
                description: 'renders status-indicator slot with content',
                test: async () => {
                  const el = this.component;
                  const badgeContent = 'Badge Indicator';
                  el.innerHTML = `<div slot="status-indicator">${badgeContent}</div>`;
                  const statusSlot = el.querySelector('[slot="status-indicator"]') as HTMLSlotElement;
                  expect(statusSlot).to.not.be.null;
                  expect(statusSlot.textContent).to.equal(badgeContent);
                },
              },
              noStatusIndicator: {
                description: 'should not render the status-indicator slot when no content is provided',
                test: async () => {
                  const el = this.component;
                  expect(getComputedStyle(el.shadowRoot!.querySelector('.status-container')!).display).to.equal('none');
                },
              },
            },
          },
          properties: {
            description: 'properties',
            tests: {
              ariaLabel: {
                description: 'sets aria-label based on the label property',
                test: async () => {
                  const el = this.component;
                  const labelValue = 'User Avatar';

                  el.label = labelValue;
                  await elementUpdated(el!);
                  const ariaLabel = el.shadowRoot?.querySelector('[role="img"]')?.getAttribute('aria-label');

                  expect(ariaLabel).to.equal(labelValue);
                },
              },
              altText: {
                description: 'sets label property as alt attribute in the img element',
                test: async () => {
                  const el = this.component;
                  const labelValue = 'User Label';

                  el.label = labelValue;
                  el.image = 'https://via.placeholder.com/32x32';
                  await elementUpdated(el!);
                  const imgElement = el.shadowRoot?.querySelector('img') as HTMLImageElement;

                  expect(imgElement.alt).to.equal(labelValue);
                },
              },
              imgSrc: {
                description: 'sets the src attribute of the img element based on the image property',
                test: async () => {
                  const el = this.component;
                  const imageUrl = 'https://via.placeholder.com/32x32';

                  el.image = imageUrl;
                  await elementUpdated(el);

                  const imgElement = el.shadowRoot?.querySelector('img') as HTMLImageElement;
                  expect(imgElement.src).to.equal(imageUrl);
                },
              },
              initials: {
                description: 'initials property test',
                tests: {
                  displayInitials: {
                    description: 'displays initials when initials property is set',
                    test: async () => {
                      const el = this.component;
                      const initialsValue = 'CJ';

                      el.initials = initialsValue;
                      await elementUpdated(el!);
                      const initialsElement = el.shadowRoot?.querySelector(
                        '[part="avatar-initials"]'
                      ) as HTMLDivElement;

                      expect(initialsElement).to.not.be.null;
                      expect(initialsElement.textContent?.trim()).to.include(initialsValue);
                    },
                  },
                },
              },
              noInitials: {
                description: 'displays default slot when initials property is not set',
                test: async () => {
                  const el = this.component;

                  el.initials = '';
                  el.innerHTML = '<span>Default Content</span>';
                  await elementUpdated(el);

                  const defaultSlot = el.shadowRoot?.querySelector('slot:not([initials])') as HTMLSlotElement | null;

                  let slotContent = '';
                  if (defaultSlot) {
                    slotContent = defaultSlot
                      .assignedNodes({ flatten: true })
                      .map(node => node.textContent?.trim())
                      .join('');
                  }

                  expect(defaultSlot).to.not.be.null;
                  expect(slotContent).to.equal('Default Content');
                },
              },
            },
          },
        },
      },
    });
  }
}
