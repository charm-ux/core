import { StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import './index.js';
import { CoreAvatar } from './index.js';
import '../icon/index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-avatar');

export default {
  title: 'Core/Avatar',
  component: 'ch-avatar',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

type Story = StoryObj<CoreAvatar & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    'default-slot': `<ch-icon name="person"></ch-icon>`,
  },
};

export const Name: Story = {
  render: args => template(args),
  args: {
    initials: 'AB',
    label: 'Abby Benson',
    'default-slot': `<ch-icon name="person"></ch-icon>`,
  },
};

export const Image: Story = {
  render: args => template(args),
  args: {
    image: 'https://via.placeholder.com/32x32',
    initials: 'AB',
    label: 'Abby Benson',
    'default-slot': `<ch-icon name="person"></ch-icon>`,
  },
};

export const ImageSlot: Story = {
  render: args => template(args),
  args: {
    initials: 'AB',
    label: 'Abby Benson',
    'image-slot': `<img src="https://via.placeholder.com/32x32" alt="Abby Benson" />`,
  },
};

export const Status: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-icon name="person"></ch-icon>
        <ch-icon slot="status-indicator" name="checkmark-circle"></ch-icon>
      `
    ),
  args: {
    image: 'https://via.placeholder.com/32x32',
    initials: 'AB',
    label: 'Abby Benson',
    status: 'online',
  },
};
