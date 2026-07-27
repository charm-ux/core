import { StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import { CoreBreadcrumbItem } from './index.js';
import '../icon/index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-breadcrumb-item');

export default {
  title: 'Core/Breadcrumb Item',
  component: 'ch-breadcrumb-item',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

type Story = StoryObj<CoreBreadcrumbItem & typeof args>;

// Default breadcrumb item
export const Default: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Breadcrumb Item',
  },
};

// Breadcrumb item as a link
export const AsLink: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Link Item',
    href: 'https://example.com',
  },
};

// Current page breadcrumb item
export const CurrentPage: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Current Page',
    current: 'page',
  },
};

// Current step breadcrumb item
export const CurrentStep: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Current Step',
    current: 'step',
  },
};

// Breadcrumb item with start icon
export const WithStartIcon: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'With Icon',
    'start-slot': '<ch-icon slot="start" name="home"></ch-icon>',
  },
};

// Breadcrumb item without separator
export const WithoutSeparator: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'No Separator',
    separator: false,
  },
};

// Disabled breadcrumb item
export const Disabled: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Disabled Item',
    disabled: true,
  },
};
