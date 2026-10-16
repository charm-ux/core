import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import '../checkbox/index.js';
import './index.js';
import type { CoreCheckboxGroup } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-checkbox-group');

const meta: Meta<CoreCheckboxGroup> = {
  title: 'Core/Checkbox Group',
  component: 'ch-checkbox-group',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreCheckboxGroup & typeof args>;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-checkbox value="books">Books</ch-checkbox>
        <ch-checkbox value="music">Music</ch-checkbox>
        <ch-checkbox value="travel">Travel</ch-checkbox>
      `
    ),
  args: {
    label: 'Interests',
    'help-text': 'Select all that apply.',
  },
};

export const Preselected: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-checkbox value="books">Books</ch-checkbox>
        <ch-checkbox value="music">Music</ch-checkbox>
        <ch-checkbox value="travel">Travel</ch-checkbox>
      `
    ),
  args: {
    label: 'Interests',
    selectedValues: ['books', 'travel'],
  },
};

export const Required: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-checkbox value="email">Email</ch-checkbox>
        <ch-checkbox value="phone">Phone</ch-checkbox>
        <ch-checkbox value="mail">Mail</ch-checkbox>
      `
    ),
  args: {
    label: 'Contact methods',
    required: true,
  },
};

export const Disabled: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-checkbox value="books">Books</ch-checkbox>
        <ch-checkbox value="music">Music</ch-checkbox>
        <ch-checkbox value="travel">Travel</ch-checkbox>
      `
    ),
  args: {
    label: 'Interests',
    disabled: true,
  },
};

export const Layout: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-checkbox value="books">Books</ch-checkbox>
        <ch-checkbox value="music">Music</ch-checkbox>
        <ch-checkbox value="travel">Travel</ch-checkbox>
      `
    ),
  args: {
    label: 'Interests',
    layout: 'horizontal',
  },
};
