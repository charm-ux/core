import { elementUpdated, expect, oneEvent, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreScopedStyles } from './index.js';

export class CoreScopedStylesTests<T extends CoreScopedStyles> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      scopedStyles: {
        description: 'scoped-styles',
        tests: {
          // attribute and property tests
          properties: {
            description: 'properties',
            tests: {
              cssStyle: {
                description: 'should create a style tag when css property is set',
                test: async () => {
                  this.component.css = `--custom-color: magenta;`;
                  await elementUpdated(this.component);
                  expect(this.component.querySelector('style')).to.not.be.null;
                },
              },
              cssString: {
                description: 'should apply css when set to string',
                test: async () => {
                  this.component.innerHTML = `<div style="background-color: var(--custom-color)"></div>`;
                  this.component.css = `--custom-color: magenta;`;
                  await elementUpdated(this.component);

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(255, 0, 255)');
                },
              },
              cssArray: {
                description: 'should apply css when set to array',
                test: async () => {
                  this.component.innerHTML = `<div style="background-color: var(--custom-color); color: var(--custom-color-2)"></div>`;
                  this.component.css = [`--custom-color: magenta;`, `--custom-color-2: white;`];
                  await elementUpdated(this.component);

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(255, 0, 255)');
                  expect(getComputedStyle(div).color).to.equal('rgb(255, 255, 255)');
                },
              },
              cssUpdate: {
                description: 'should update styles when css property changes',
                test: async () => {
                  this.component.innerHTML = `<div style="background-color: var(--custom-color)"></div>`;
                  this.component.css = `--custom-color: magenta;`;
                  await elementUpdated(this.component);

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(255, 0, 255)');

                  this.component.css = `--custom-color: cyan;`;
                  await elementUpdated(this.component);
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(0, 255, 255)');
                },
              },
              cssExternal: {
                description: 'should not apply css to external elements',
                test: async () => {
                  const div = document.createElement('div');
                  div.style.backgroundColor = 'var(--custom-color)';
                  this.component.appendChild(div);

                  const externalDiv = document.createElement('div');
                  externalDiv.style.backgroundColor = 'var(--custom-color)';
                  document.body.appendChild(externalDiv);

                  this.component.css = `:root { --custom-color: magenta; }`;
                  await elementUpdated(this.component);

                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(255, 0, 255)');
                  expect(getComputedStyle(externalDiv).backgroundColor).to.not.equal('rgb(255, 0, 255)');

                  externalDiv.remove();
                },
              },
              cssAttribute: {
                description: 'should apply styles when set as attribute',
                config: {
                  css: `--custom-color: magenta;`,
                },
                test: async () => {
                  const div = document.createElement('div');
                  div.style.backgroundColor = 'var(--custom-color)';
                  this.component.appendChild(div);
                  await elementUpdated(this.component);

                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(255, 0, 255)');
                },
              },
              cssEmptyString: {
                description: 'should remove styles when set to an empty string',
                test: async () => {
                  this.component.innerHTML = `<div style="background-color: var(--custom-color)"></div>`;
                  this.component.css = `--custom-color: magenta;`;
                  await elementUpdated(this.component);

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(255, 0, 255)');

                  this.component.css = '';
                  await elementUpdated(this.component);
                  expect(getComputedStyle(div).backgroundColor).to.not.equal('rgb(255, 0, 255)');
                },
              },
              cssUndefined: {
                description: 'should remove styles when set to undefined',
                test: async () => {
                  this.component.innerHTML = `<div style="background-color: var(--custom-color)"></div>`;
                  this.component.css = `--custom-color: magenta;`;
                  await elementUpdated(this.component);

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(255, 0, 255)');

                  // @ts-expect-error - intentionally testing undefined even though it's not correct type
                  this.component.css = undefined;
                  await elementUpdated(this.component);
                  expect(getComputedStyle(div).backgroundColor).to.not.equal('rgb(255, 0, 255)');
                },
              },
            },
          },

          // slot tests
          slots: {
            description: 'slots',
            tests: {
              stylesheetStyle: {
                description: 'should create a style tag when stylesheet is slotted',
                test: async () => {
                  this.component.innerHTML = `
                    <link disabled slot="stylesheets" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css" rel="stylesheet" crossorigin="anonymous">
                  `;
                  await oneEvent(this.component, 'styles-loaded');
                  expect(this.component.querySelector('style')).to.not.be.null;
                },
              },
              stylesheetSingle: {
                description: 'should apply stylesheet',
                test: async () => {
                  this.component.innerHTML = `
                    <link disabled slot="stylesheets" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css" rel="stylesheet" crossorigin="anonymous">
                    <div style="background: var(--bs-blue)">Test</div>
                  `;
                  await oneEvent(this.component, 'styles-loaded');
                  await elementUpdated(this.component);

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(13, 110, 253)');
                },
              },
              stylesheetMultiple: {
                description: 'should apply multiple stylesheets',
                test: async () => {
                  this.component.innerHTML = `
                    <link disabled slot="stylesheets" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css" rel="stylesheet" crossorigin="anonymous">
                    <link disabled slot="stylesheets" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-grid.min.css" rel="stylesheet" crossorigin="anonymous">
                    <div style="background: var(--bs-blue); width: var(--bs-breakpoint-sm)">Test</div>
                  `;
                  await oneEvent(this.component, 'styles-loaded');

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(13, 110, 253)');
                  expect(getComputedStyle(div).width).to.equal('576px');
                },
              },
              stylesheetUpdate: {
                description: 'should update styles when stylesheet changes',
                test: async () => {
                  this.component.innerHTML = `
                    <link disabled slot="stylesheets" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css" rel="stylesheet" crossorigin="anonymous">
                    <div style="background: var(--bs-blue); width: var(--bs-breakpoint-sm)">Test</div>
                  `;
                  await oneEvent(this.component, 'styles-loaded');

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(13, 110, 253)');
                  expect(getComputedStyle(div).width).to.not.equal('576px');

                  this.component.querySelector('link')!.remove();
                  const link = Object.assign(document.createElement('link'), {
                    disabled: true,
                    slot: 'stylesheets',
                    rel: 'stylesheet',
                    href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-grid.min.css',
                  });
                  link.setAttribute('crossorigin', 'anonymous');
                  this.component.appendChild(link);
                  await oneEvent(this.component, 'styles-loaded');

                  expect(getComputedStyle(div).backgroundColor).to.not.equal('rgb(13, 110, 253)');
                  expect(getComputedStyle(div).width).to.equal('576px');
                },
              },
              stylesheetExternal: {
                description: 'should not apply stylesheet to external elements',
                test: async () => {
                  this.component.innerHTML = `
                    <link disabled slot="stylesheets" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css" rel="stylesheet" crossorigin="anonymous">
                    <div style="background: var(--bs-blue); width: var(--bs-breakpoint-sm)">Test</div>
                  `;
                  await oneEvent(this.component, 'styles-loaded');

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(13, 110, 253)');

                  const externalDiv = document.createElement('div');
                  document.body.appendChild(externalDiv);
                  expect(getComputedStyle(externalDiv).backgroundColor).to.not.equal('rgb(13, 110, 253)');
                  externalDiv.remove();
                },
              },
              cssAndSlot: {
                description: 'should apply both css and slotted stylesheet',
                test: async () => {
                  this.component.innerHTML = `
                    <link disabled slot="stylesheets" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css" rel="stylesheet" crossorigin="anonymous">
                    <div style="background: var(--bs-blue); color: var(--custom-color)">Test</div>
                  `;
                  this.component.css = `--custom-color: magenta;`;
                  await oneEvent(this.component, 'styles-loaded');
                  await elementUpdated(this.component);

                  const div = this.component.querySelector('div')!;
                  expect(getComputedStyle(div).backgroundColor).to.equal('rgb(13, 110, 253)');
                  expect(getComputedStyle(div).color).to.equal('rgb(255, 0, 255)');
                },
              },
            },
          },

          // event tests
          events: {
            description: 'events',
            tests: {
              propStylesLoaded: {
                description: 'should emit "styles-loaded" event when using css property',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('styles-loaded', spy);
                  this.component.css = `--custom-color: magenta;`;
                  await waitUntil(() => spy.called);

                  expect(spy).to.have.been.calledOnce;
                },
              },
              slottedStylesLoaded: {
                description: 'should emit "styles-loaded" event when using slotted stylesheet',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('styles-loaded', spy);
                  this.component.innerHTML = `
                    <link disabled slot="stylesheets" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css" rel="stylesheet" crossorigin="anonymous">
                  `;
                  await waitUntil(() => spy.called);

                  expect(spy).to.have.been.calledOnce;
                },
              },
            },
          },
        },
      },
    });
  }
}
