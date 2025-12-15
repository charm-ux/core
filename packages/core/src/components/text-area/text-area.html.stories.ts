import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreTextArea } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-text-area');

const meta: Meta<CoreTextArea> = {
  title: 'Core/TextArea',
  component: 'ch-text-area',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreTextArea & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    label: 'Feedback:',
  },
};

export const Resize: Story = {
  render: args => template(args),
  args: {
    label: 'Resize',
    resize: 'both',
  },
};

export const Disabled: Story = {
  render: args => template(args),
  args: {
    label: 'Disabled',
    disabled: true,
  },
};

export const WithHelpText: Story = {
  render: args => template(args),
  args: {
    label: 'Feedback:',
    'help-text': 'Tell us what you think',
  },
};

export const Placeholder: Story = {
  render: args => template(args),
  args: {
    label: 'Feedback:',
    placeholder: 'type here...',
  },
};

export const Required: Story = {
  render: args => template(args),
  args: {
    label: 'Feedback:',
    required: true,
  },
};

export const Readonly: Story = {
  render: args => template(args),
  args: {
    label: 'Feedback:',
    readonly: true,
    value: 'This text area is readonly',
  },
};
