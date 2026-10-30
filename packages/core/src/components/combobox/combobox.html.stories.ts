import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import '../option/index.js';
import '../option-group/index.js';
import './index.js';
import type { CoreCombobox } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-combobox');

const meta: Meta<CoreCombobox> = {
  title: 'Core/Combobox',
  component: 'ch-combobox',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreCombobox & typeof args>;

const fruits = html`
  <ch-option value="apple">Apple</ch-option>
  <ch-option value="banana">Banana</ch-option>
  <ch-option value="cherry">Cherry</ch-option>
  <ch-option value="grape">Grape</ch-option>
  <ch-option value="orange">Orange</ch-option>
`;

export const Default: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    placeholder: 'Search fruit',
    'help-text': 'Start typing to filter the list.',
  },
};

export const SelectOnly: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    value: 'banana',
    mode: 'select-only',
    'help-text': 'Use the arrow keys or type to find a fruit, then press Enter or Space to select it.',
  },
};

export const ListAutocomplete: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    mode: 'list',
    placeholder: 'Search fruit',
  },
};

export const InlineAutocomplete: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    mode: 'inline',
    placeholder: 'Type a fruit',
  },
};

export const NoAutocomplete: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    mode: 'none',
    placeholder: 'Enter a value',
  },
};

export const Multiple: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruits',
    name: 'fruits',
    multiple: true,
    'with-clear': true,
    'help-text': 'Select as many as you like.',
  },
};

export const Grouped: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-option-group label="Citrus">
          <ch-option value="orange">Orange</ch-option>
          <ch-option value="lemon">Lemon</ch-option>
          <ch-option value="lime">Lime</ch-option>
        </ch-option-group>
        <ch-option-group label="Berries">
          <ch-option value="strawberry">Strawberry</ch-option>
          <ch-option value="blueberry">Blueberry</ch-option>
          <ch-option value="raspberry">Raspberry</ch-option>
        </ch-option-group>
      `
    ),
  args: {
    label: 'Produce',
    name: 'produce',
    placeholder: 'Search produce',
  },
};

export const CustomValue: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    'allows-custom-value': true,
    'help-text': 'Choose an option or type your own fruit.',
  },
};

export const WithClear: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    value: 'cherry',
    'with-clear': true,
  },
};

export const ManualTrigger: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    'menu-trigger': 'manual',
    'help-text': 'Type to filter, then use the chevron or arrow keys to open the list.',
  },
};

export const DisabledOptions: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-option value="apple">Apple</ch-option>
        <ch-option value="banana" disabled>Banana (out of stock)</ch-option>
        <ch-option value="cherry">Cherry</ch-option>
      `
    ),
  args: {
    label: 'Fruit',
    name: 'fruit',
  },
};

export const NoResults: Story = {
  render: args =>
    template(
      args,
      html`
        ${fruits}
        <span slot="no-results">No fruit matches your search.</span>
      `
    ),
  args: {
    label: 'Fruit',
    name: 'fruit',
    'allows-empty-collection': true,
  },
};

export const Loading: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    loading: true,
    open: true,
  },
};

export const Required: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    required: true,
    'error-message': 'Choose a fruit to continue.',
  },
};

export const HelpTextAndErrorMessage: Story = {
  render: args => template(args, html`${fruits}`),
  args: {
    label: 'Fruit',
    name: 'fruit',
    'help-text': 'Start typing to filter the list.',
    'error-message': 'Choose a fruit to continue.',
  },
};
