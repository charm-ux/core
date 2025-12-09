import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreAlert } from './index.js';
import '../button/index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-alert');

const meta: Meta<CoreAlert> = {
  title: 'Core/Alert',
  component: 'ch-alert',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreAlert & typeof args>;

export const Default: Story = {
  render: args => template(args, html`Message bar content`),
  args: {
    open: true,
  },
};

export const Dismissible: Story = {
  render: args => html`
    <ch-button id="btn">Toggle Alert</ch-button>
    ${template(args, html`Message providing information to the user with actionable insights.`)}

    <script type="module">
      const component = document.querySelector('ch-alert');
      const button = document.querySelector('#btn');
      button.addEventListener('click', () => component.toggle());
    </script>
  `,
  args: {
    open: true,
    heading: 'Heading',
    dismissible: true,
  },
};

export const Heading: Story = {
  render: args => template(args, html`Message bar content`),
  args: {
    open: true,
    heading: 'Heading',
  },
};

export const LongContent: Story = {
  render: args =>
    template(
      args,
      html`Message bar content
        <div>
          line 1
          <br />
          line 2
          <br />
          line 3
          <br />
          line 4
          <br />
          line 5
          <br />
        </div>`
    ),
  args: {
    open: true,
  },
};

export const Link: Story = {
  render: args =>
    template(
      args,
      html`For more details, please refer to our
        <ch-button href="https://aka.ms/NewAcquisitionReport" appearance="link" target="_blank" external>
          documentation page.
        </ch-button>`
    ),
  args: {
    open: true,
  },
};

export const Actions: Story = {
  render: args =>
    template(
      args,
      html`Message providing information to the user with actionable insights.
        <ch-button slot="action">Action1</ch-button>
        <ch-button slot="action">Action2</ch-button> `
    ),
  args: {
    open: true,
    heading: 'Heading',
  },
};

export const Transition: Story = {
  render: args => html`
    <ch-button id="btn">Show Alert</ch-button>
    ${template(args, html`Message providing information to the user with actionable insights.`)}

    <script type="module">
      const component = document.querySelector('[alert]');
      const button = document.querySelector('#btn');
      button.addEventListener('click', () => component.toggle());
    </script>
  `,
  args: {
    open: true,
    heading: 'Heading',
    dismissible: true,
    '--alert-transition': 'opacity 1s',
  },
};
