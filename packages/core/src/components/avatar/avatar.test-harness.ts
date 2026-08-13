import { elementUpdated, expect, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreAvatar } from './index.js';

/** A valid 1x1 PNG that loads synchronously without network access. */
const loadableImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

/** A second valid 1x1 PNG, used to verify a new image source resets the error state. */
const alternateLoadableImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2ZkUAAAAASUVORK5CYII=';

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
                  el.image = loadableImage;
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
              defaultIconFallback: {
                description: 'renders a default person icon when no image, initials, or slot content is provided',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);

                  const icon = el.shadowRoot?.querySelector('[part="avatar-icon"]');
                  expect(icon).to.not.be.null;
                  expect(icon?.querySelector('slot')).to.not.be.null;
                  expect(el.shadowRoot?.querySelector('ch-icon')).to.not.be.null;
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
              fallbackAccessibleLabel: {
                description: 'labels the default slot fallback as an image when a label is provided',
                test: async () => {
                  const el = this.component;
                  el.label = 'User';
                  await elementUpdated(el);

                  const icon = el.shadowRoot?.querySelector('[part="avatar-icon"]');
                  expect(icon?.getAttribute('role')).to.equal('img');
                  expect(icon?.getAttribute('aria-label')).to.equal('User');
                },
              },
              initialsLabeledWithoutImage: {
                description: 'labels the initials as an image when no real image is shown',
                test: async () => {
                  const el = this.component;
                  el.label = 'User';
                  el.initials = 'JD';
                  await elementUpdated(el);
                  const initials = el.shadowRoot?.querySelector('[part="avatar-initials"]');
                  expect(initials?.getAttribute('role')).to.equal('img');
                  expect(initials?.getAttribute('aria-label')).to.equal('User');
                },
              },
              imageShownNoDuplicateImgRole: {
                description: 'does not render initials when a real image is shown',
                test: async () => {
                  const el = this.component;
                  el.label = 'User';
                  el.image = loadableImage;
                  await elementUpdated(el);
                  const initials = el.shadowRoot?.querySelector('[part="avatar-initials"]');
                  expect(initials).to.be.null;
                },
              },
              altText: {
                description: 'sets label property as alt attribute in the img element',
                test: async () => {
                  const el = this.component;
                  const labelValue = 'User Label';

                  el.label = labelValue;
                  el.image = loadableImage;
                  await elementUpdated(el!);
                  const imgElement = el.shadowRoot?.querySelector('img') as HTMLImageElement;

                  expect(imgElement.alt).to.equal(labelValue);
                },
              },
              imgSrc: {
                description: 'sets the src attribute of the img element based on the image property',
                test: async () => {
                  const el = this.component;

                  el.image = loadableImage;
                  await elementUpdated(el);

                  const imgElement = el.shadowRoot?.querySelector('img') as HTMLImageElement;
                  expect(imgElement.getAttribute('src')).to.equal(loadableImage);
                },
              },
              loading: {
                description: 'passes the loading mode to the image',
                test: async () => {
                  const el = this.component;
                  el.image = loadableImage;
                  await elementUpdated(el);

                  const imgElement = el.shadowRoot?.querySelector('img') as HTMLImageElement;
                  expect(imgElement.loading).to.equal('eager');

                  el.loading = 'lazy';
                  await elementUpdated(el);

                  expect(imgElement.loading).to.equal('lazy');
                },
              },
              imageErrorFallback: {
                description: 'falls back to initials and emits avatar-error when the image fails to load',
                test: async () => {
                  const el = this.component;
                  el.image = loadableImage;
                  el.initials = 'JD';
                  await elementUpdated(el);

                  const errorHandler = sinon.spy();
                  el.addEventListener('avatar-error', errorHandler);

                  const imgElement = el.shadowRoot?.querySelector('img') as HTMLImageElement;
                  expect(imgElement).to.not.be.null;
                  imgElement.dispatchEvent(new Event('error'));

                  await waitUntil(() => errorHandler.calledOnce, 'avatar-error should fire');
                  await elementUpdated(el);

                  expect(el.shadowRoot?.querySelector('img')).to.be.null;
                  expect(el.shadowRoot?.querySelector('[part="avatar-initials"]')).to.not.be.null;
                },
              },
              imageErrorReset: {
                description: 'retries the image when a new source is provided after an error',
                test: async () => {
                  const el = this.component;
                  el.image = loadableImage;
                  await elementUpdated(el);

                  const imgElement = el.shadowRoot?.querySelector('img') as HTMLImageElement;
                  imgElement.dispatchEvent(new Event('error'));
                  await elementUpdated(el);

                  expect(el.shadowRoot?.querySelector('img')).to.be.null;

                  const retryImage = alternateLoadableImage;
                  el.image = retryImage;
                  await elementUpdated(el);

                  const retriedImg = el.shadowRoot?.querySelector('img') as HTMLImageElement;
                  expect(retriedImg).to.not.be.null;
                  expect(retriedImg.getAttribute('src')).to.equal(retryImage);
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
