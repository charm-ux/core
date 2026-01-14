import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import { html } from 'lit';
import type { CoreCheckbox } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-checkbox');

const meta: Meta<CoreCheckbox> = {
  title: 'Core/Checkbox',
  component: 'ch-checkbox',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreCheckbox & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    label: 'Checkbox',
  },
};

export const Checked: Story = {
  render: args => template(args),
  args: {
    label: 'Checked',
    checked: true,
  },
};

export const Mixed: Story = {
  render: args => template(args),
  args: {
    label: 'Mixed',
    indeterminate: true,
  },
};

export const Disabled: Story = {
  render: args => template(args),
  args: {
    label: 'Disabled',
    disabled: true,
  },
};

export const LabelBefore: Story = {
  render: args => template(args),
  args: {
    label: 'Label before',
    'label-position': 'before',
  },
};

export const LabelWrapping: Story = {
  render: args =>
    html` ${template(args)}
      <style>
        ch-checkbox {
          max-width: 400px;
        }
      </style>`,
  args: {
    label: 'Here is an example of a checkbox with a long label and it starts to wrap to a second line',
  },
};

export const Required: Story = {
  render: args => template(args),
  args: {
    label: 'Required',
    required: true,
  },
};

export const ResetForm: Story = {
  render: args => html`
    <form>
      ${template(args)}
      <button type="reset">Reset</button>
    </form>
  `,
  args: {
    'default-slot': 'Checked by default',
    checked: true,
  },
};
