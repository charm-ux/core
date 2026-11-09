import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import '../icon/index.js';
import type { CoreSelect } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-select');

const meta: Meta<CoreSelect> = {
  title: 'Core/Select',
  component: 'ch-select',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreSelect & typeof args>;

export const Default: Story = {
  render: args =>
    html`${template(
      args,
      html` <option value="">Choose option</option>
        <option value="1">Option One</option>
        <option value="2">Option Two</option>
        <option value="3">Option Three</option>`
    )}`,
  args: {
    label: 'Options',
    id: 'option-select',
    name: 'Options',
  },
};

export const InitialValue: Story = {
  render: args =>
    html`${template(
      args,
      html` <option value="">Choose option</option>
        <option value="1">Option One</option>
        <option value="2" selected>Option Two</option>
        <option value="3">Option Three</option>`
    )}`,
  args: {
    label: 'Controlled',
  },
};

export const WithIcons: Story = {
  render: args =>
    html`${template(
      args,
      html` <option value="">Choose option</option>
        <option value="1">Option One</option>
        <option value="2" selected>Option Two</option>
        <option value="3">Option Three</option>
        <ch-icon slot="start" name="person"></ch-icon>
        <ch-icon slot="end" name="person"></ch-icon>`
    )}`,
  args: {
    label: 'Controlled',
  },
};

export const WithDisabledOption: Story = {
  render: args =>
    html`${template(
      args,
      html`
        <option value="">Choose option</option>
        <option value="1">Option One</option>
        <option value="2" disabled>Disabled Option</option>
        <option value="3">Option Three</option>
      `
    )}`,
  args: {
    label: 'With Disabled Option',
    id: 'select-with-disabled',
    name: 'disabledSelect',
  },
};
