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
    valueAsArray: ['books', 'travel'],
  },
};

export const CommaSeparatedValue: Story = {
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
    value: 'books,travel',
  },
};

export const AlternativeDelimiter: Story = {
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
    value: 'books|travel',
    'value-delimiter': '|',
  },
};

export const Listbox: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-checkbox value="books">Books</ch-checkbox>
        <ch-checkbox value="music">Music</ch-checkbox>
        <ch-checkbox value="travel">Travel</ch-checkbox>
        <ch-checkbox value="sports">Sports</ch-checkbox>
        <ch-checkbox value="cooking">Cooking</ch-checkbox>
      `
    ),
  args: {
    label: 'Interests',
    'help-text': 'Use the arrow keys to move and Space to select.',
    listbox: true,
  },
};

export const ListboxWithPreselectedValues: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-checkbox value="books">Books</ch-checkbox>
        <ch-checkbox value="music">Music</ch-checkbox>
        <ch-checkbox value="travel">Travel</ch-checkbox>
        <ch-checkbox value="sports">Sports</ch-checkbox>
        <ch-checkbox value="cooking">Cooking</ch-checkbox>
      `
    ),
  args: {
    label: 'Interests',
    'help-text': 'Use arrow keys to move, then Space to select.',
    listbox: true,
    valueAsArray: ['music', 'sports'],
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

export const HorizontalStackedLayout: Story = {
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
    layout: 'horizontal-stacked',
  },
};

export const DisabledOptionsOnly: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-checkbox value="books" checked>Books</ch-checkbox>
        <ch-checkbox value="music" disabled>Music</ch-checkbox>
        <ch-checkbox value="travel">Travel</ch-checkbox>
      `
    ),
  args: {
    label: 'Interests',
  },
};

export const HelpTextAndErrorMessage: Story = {
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
    'error-message': 'Select at least one interest.',
  },
};
