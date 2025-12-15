import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreRadioGroup } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-radio-group');

const meta: Meta<CoreRadioGroup> = {
  title: 'Core/RadioGroup',
  component: 'ch-radio-group',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreRadioGroup & typeof args>;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-radio value="birds">Birds</ch-radio>
        <ch-radio value="cats">Cats</ch-radio>
        <ch-radio value="dogs">Dogs</ch-radio>
      `
    ),
  args: {
    label: 'Favorite Pet',
    'help-text': 'Select the best option.',
  },
};

export const NoValue: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-radio>Birds</ch-radio>
        <ch-radio>Cats</ch-radio>
        <ch-radio>Dogs</ch-radio>
      `
    ),
  args: {
    label: 'Favorite Pet',
    'help-text': 'Select the best option.',
  },
};

export const SettingADefaultValue: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-radio value="ice-man">Ice Man</ch-radio>
        <ch-radio value="maverick">Maverick</ch-radio>
        <ch-radio value="viper">Viper</ch-radio>
        <ch-radio value="jester">Jester</ch-radio>
      `
    ),
  args: {
    label: 'Setting a default value',
    value: 'maverick',
  },
};

export const Required: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-radio value="birds">Birds</ch-radio>
        <ch-radio value="cats">Cats</ch-radio>
        <ch-radio value="dogs">Dogs</ch-radio>
      `
    ),
  args: {
    label: 'Favorite Pet',
    required: true,
  },
};

export const DisabledItems: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-radio value="birds">Birds</ch-radio>
        <ch-radio value="cats">Cats</ch-radio>
        <ch-radio value="dogs">Dogs</ch-radio>
      `
    ),
  args: {
    disabled: true,
    label: 'Favorite Pet',
  },
};

export const Layout: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-radio value="birds">Birds</ch-radio>
        <ch-radio value="cats">Cats</ch-radio>
        <ch-radio value="dogs">Dogs</ch-radio>
      `
    ),
  args: {
    label: 'Layout',
    layout: 'horizontal-stacked',
  },
};
