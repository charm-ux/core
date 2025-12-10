import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import '../button/index.js';
import './index.js';
import type { CoreTooltip } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-tooltip');

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
  render: args => template(args, html` <ch-button style="display: inline-block">Paint</ch-button> `),
  args: {
    content: 'Paintbrush tool',
  },
};

export const InitiallyOpen: Story = {
  render: args => template(args, html` <ch-button style="display: inline-block">Paint</ch-button> `),
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
  render: args => template(args, html` <ch-button>Paint</ch-button> `),
  args: {
    content: 'Paintbrush tool',
    '--tooltip-show-delay': '1000ms',
    '--tooltip-hide-delay': '1000ms',
  },
};
