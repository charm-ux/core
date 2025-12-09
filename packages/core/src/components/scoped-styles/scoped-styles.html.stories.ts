import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreScopedStyles } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-scoped-styles');

const meta: Meta<CoreScopedStyles> = {
  title: 'Core/Theme',
  component: 'ch-scoped-styles',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreScopedStyles & typeof args>;

const css = `
  :root {
    --button-bg-color: teal;
    --button-fg-color: white;
  }
`;

export const Default: Story = {
  render: args => html`
    ${template(args, html` <ch-button>Test button</ch-button> `)}

    <br /><br />
    <ch-button>Outside of theme component</ch-button>
  `,
  args: {
    css,
  },
};

export const WithStylesheet: Story = {
  render: args => html`
    ${template(
      args,
      html`
        <link
          disabled
          slot="stylesheets"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css"
          rel="stylesheet"
          crossorigin="anonymous"
        />
        <div style="background: var(--bs-blue)">Test</div>
      `
    )}

    <div style="background: var(--bs-blue)">Outside of theme component</div>
  `,
  args: {},
};

export const WithMultipleStylesheets: Story = {
  render: args => html`
    ${template(
      args,
      html`
        <link
          disabled
          slot="stylesheets"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css"
          rel="stylesheet"
          crossorigin="anonymous"
        />
        <link
          disabled
          slot="stylesheets"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-grid.min.css"
          rel="stylesheet"
          crossorigin="anonymous"
        />
        <div style="border:1px solid var(--bs-blue); width: var(--bs-breakpoint-sm)">Should be 576px</div>
      `
    )}

    <div style="background: var(--bs-blue)">Outside of theme component</div>
  `,
  args: {},
};
