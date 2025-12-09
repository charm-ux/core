import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreBadge } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-badge');

const meta: Meta<CoreBadge> = {
  title: 'Core/Badge',
  component: 'ch-badge',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreBadge & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    'default-slot': '1',
    '--badge-border-style': 'solid',
  },
};
