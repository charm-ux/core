import { StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import { CoreMenuItem } from './index.js';
import '../icon/index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-menu-item');

export default {
  title: 'Core/MenuItem',
  component: 'ch-menu-item',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

type Story = StoryObj<CoreMenuItem & typeof args>;

// Default menu item
export const Default: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Menu Item',
  },
};

// Menu item with a prefix icon
export const WithStartIcon: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Menu Item with start slot',
    'start-slot': '<ch-icon slot="start" name="person"></ch-icon>',
  },
};

// Menu item with a prefix icon
export const WithEndIcon: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Menu Item with end slot',
    'end-slot': '<ch-icon slot="end" name="warning-shield"></ch-icon>',
  },
};

// Disabled menu item
export const Disabled: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Disabled Menu Item',
    disabled: true,
  },
};

// Menu item as a link
export const AsLink: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Menu Item as Link',
    href: 'https://example.com',
    target: '_blank',
  },
};
