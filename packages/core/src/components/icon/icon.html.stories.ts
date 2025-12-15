import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import './index.js';
import type { CoreIcon } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-icon');

const meta: Meta<CoreIcon> = {
  title: 'Core/Icon',
  component: 'ch-icon',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreIcon & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    name: 'close',
    label: 'Close',
  },
};

export const BadIconName: Story = {
  render: args => template(args),
  args: {
    // @ts-ignore
    name: 'bad-icon-name',
    label: 'Bad Icon Name',
  },
};

export const IconFromURL: Story = {
  render: args => template(args),
  args: {
    url: 'https://api.iconify.design/fluent:chat-12-filled.svg',
    label: 'Chat',
  },
};

export const IconFromBadURL: Story = {
  render: args => template(args),
  args: {
    url: 'https://www.example.com/bad-url.svg',
    label: 'Bad URL',
  },
};

export const IconWithStyles: Story = {
  render: args => html`
    ${template(args)}
    <style>
      ch-icon {
        color: red;
        font-size: 5rem;
        rotate: 90deg;
      }
    </style>
  `,
  args: {
    name: 'warning',
    label: 'Warning',
  },
};
