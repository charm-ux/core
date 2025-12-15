import { html } from 'lit';
import { StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreProgressBar } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-progress-bar');

export default {
  title: 'Core/Progress Bar',
  component: 'ch-progress-bar',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

type Story = StoryObj<CoreProgressBar & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    label: 'Default Progress Bar',
  },
};

export const Indeterminate: Story = {
  render: args => template(args),
  args: {
    label: 'Indeterminate Progress Bar',
    indeterminate: true,
  },
};

export const Height: Story = {
  render: args =>
    html` ${template(args)}
      <style>
        [progress-bar] {
          --progress-bar-height: 20px;
        }
      </style>`,
  args: {
    label: 'Custom Height Progress Bar',
  },
};

export const HelpText: Story = {
  render: args => template(args),
  args: {
    label: 'Progress Bar',
    'help-text': '70% complete',
  },
};

export const HideLabel: Story = {
  render: args => template(args),
  args: {
    label: 'Progress Bar',
    'help-text': '70% complete',
    'hide-label': true,
  },
};
