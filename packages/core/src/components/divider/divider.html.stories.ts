import { StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import './index.js';
import type { CoreDivider } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-divider');

export default {
  title: 'Core/Divider',
  component: 'ch-divider',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

type Story = StoryObj<CoreDivider & typeof args>;

export const Default: Story = {
  render: () => template(),
};

export const Text: Story = {
  render: args => template(args, html` Text`),
};

export const Vertical: Story = {
  render: args => template(args, html` Text`),
  args: {
    orientation: 'vertical',
  },
};

export const Inset: Story = {
  render: args => template(args, html` Text`),
  args: {
    inset: true,
  },
};

export const AlignContent: Story = {
  render: args => template(args, html` Text`),
  args: {
    'align-content': 'end',
  },
};
