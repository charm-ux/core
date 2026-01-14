import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import { html } from 'lit';
import type { CoreSpinner } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-spinner');

const meta: Meta<CoreSpinner> = {
  title: 'Core/Spinner',
  component: 'ch-spinner',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreSpinner & typeof args>;

export const Default: Story = {
  render: args => template(args),
};

export const Label: Story = {
  render: args => template(args),
  args: {
    label: 'Loading',
    indeterminate: true,
  },
};

export const LabelPosition: Story = {
  render: args => template(args),
  args: {
    label: 'Loading',
    'label-position': 'above',
    value: 35,
  },
};

export const Size: Story = {
  render: args => html`
    ${template(args)}
    <style>
      ch-spinner {
        --spinner-ring-size: 50px;
      }
    </style>
  `,
  args: {
    label: 'Custom size',
  },
};
