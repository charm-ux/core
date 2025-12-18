import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import '../button/index.js';
import './index.js';
import type { CoreTooltip } from './index.js';

const { args, argTypes, events, template } = getWcStorybookHelpers('ch-tooltip');

const meta: Meta<CoreTooltip> = {
  title: 'Core/Tooltip',
  component: 'ch-tooltip',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
    controls: {
      sort: 'alpha',
    },
  },
};

export default meta;

type Story = StoryObj<CoreTooltip & typeof args>;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button slot="anchor" style="display: inline-block">Paint</ch-button>
        <div slot="content">Hello</div>
      `
    ),
  args: {
    content: 'Paintbrush tool',
  },
};

export const InitiallyOpen: Story = {
  render: args => template(args, html` <ch-button slot="anchor" style="display: inline-block">Paint</ch-button> `),
  args: {
    content: 'Paintbrush tool',
    open: true,
  },
};

export const Anchor: Story = {
  render: args => html`
    <ch-button id="button1">Paint</ch-button>
    ${template(args)}
  `,
  args: {
    content: 'Paintbrush tool',
    anchor: 'button1',
  },
};

export const Delay: Story = {
  render: args => template(args, html` <ch-button slot="anchor">Paint</ch-button> `),
  args: {
    content: 'Paintbrush tool',
    '--tooltip-show-delay': '1000ms',
    '--tooltip-hide-delay': '1000ms',
  },
};
