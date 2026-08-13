import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import '../icon/index.js';
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

export const WithStartIcon: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'New',
    'start-slot': '<ch-icon slot="start" name="checkmark-circle"></ch-icon>',
    '--badge-border-style': 'solid',
  },
};

export const WithEndIcon: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'New',
    'end-slot': '<ch-icon slot="end" name="dismiss"></ch-icon>',
    '--badge-border-style': 'solid',
  },
};
