import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreSwitch } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-switch');

const meta: Meta<CoreSwitch> = {
  title: 'Core/Switch',
  component: 'ch-switch',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreSwitch & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    'label-slot': 'My label',
    'checked-message-slot': 'On',
    'unchecked-message-slot': 'Off',
  },
};

export const Disabled: Story = {
  render: args => template(args),
  args: {
    'label-slot': 'My label',
    disabled: true,
    'checked-message-slot': 'On',
    'unchecked-message-slot': 'Off',
  },
};

export const Required: Story = {
  render: args => template(args),
  args: {
    'label-slot': 'My label',
    required: true,
    'help-text': 'Help text',
    'checked-message-slot': 'On',
    'unchecked-message-slot': 'Off',
  },
};

export const LabelPosition: Story = {
  render: args => template(args),
  args: {
    'label-slot': 'My label',
    'label-position': 'start',
    'checked-message-slot': 'On',
    'unchecked-message-slot': 'Off',
  },
};
