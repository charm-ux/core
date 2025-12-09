import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreCard } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-card');

const meta: Meta<CoreCard> = {
  title: 'Core/Card',
  component: 'ch-card',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreCard & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    'media-slot': '<img src="https://via.placeholder.com/100x100" width="100" height="100" alt="image alt text" />',
    'default-slot': 'Content slot.',
  },
};

export const MediaBlockEnd: Story = {
  render: args => template(args),
  args: {
    'media-slot': '<img src="https://via.placeholder.com/100x100" width="100" height="100" alt="image alt text" />',
    'default-slot': 'Content slot.',
    'media-position': 'bottom',
  },
};

export const MediaInlineStart: Story = {
  render: args => template(args),
  args: {
    'media-slot': '<img src="https://via.placeholder.com/100x100" width="100" height="100" alt="image alt text" />',
    'default-slot': 'Content slot.',
    'media-position': 'start',
  },
};

export const MediaInlineEnd: Story = {
  render: args => template(args),
  args: {
    'media-slot': '<img src="https://via.placeholder.com/100x100" width="100" height="100" alt="image alt text" />',
    'default-slot': 'Content slot.',
    'media-position': 'end',
  },
};

export const WithHeaderSubheaderFooterSlots: Story = {
  render: args => template(args),
  args: {
    'media-slot': '<img src="https://via.placeholder.com/100x100" width="100" height="100" alt="image alt text" />',
    'default-slot': 'Content slot.',
    'heading-slot': 'Heading slot.',
    'subheading-slot': 'Subheading slot.',
    'footer-slot': 'Footer slot.',
  },
};
