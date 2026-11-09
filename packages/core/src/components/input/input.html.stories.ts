import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import '../icon/index.js';
import type { CoreInput } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-input');

const meta: Meta<CoreInput> = {
  title: 'Core/Input',
  component: 'ch-input',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreInput & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    label: 'Sample input',
  },
};

export const Required: Story = {
  render: args => template(args),
  args: {
    label: 'Label',
    required: true,
  },
};

export const Disabled: Story = {
  render: args => template(args),
  args: {
    disabled: true,
    label: 'Disabled',
    placeholder: 'This is a placeholder',
  },
};

export const Placeholder: Story = {
  render: args => template(args),
  args: {
    label: 'Placeholder',
    placeholder: 'This is a placeholder',
  },
};

export const ContentBeforeOrAfter: Story = {
  render: args =>
    template(
      args,
      html`<span slot="label">label</span><ch-icon slot="start" name="person"></ch-icon>
        <ch-icon slot="end" name="person"></ch-icon>`
    ),
};

export const Type: Story = {
  render: args => template(args),
  args: {
    type: 'password',
    label: 'Password',
  },
};

export const Datalist: Story = {
  render: args =>
    template(
      args,
      html`
        <option value="Chocolate"></option>
        <option value="Coconut"></option>
        <option value="Mint"></option>
        <option value="Strawberry"></option>
        <option value="Vanilla"></option>
      `
    ),
};

export const Slider: Story = {
  render: args => template(args),
  args: {
    type: 'range',
    label: 'Slider',
  },
};

export const SliderWithSteps: Story = {
  render: args =>
    template(
      args,
      html`
        <option value="0"></option>
        <option value="25"></option>
        <option value="50"></option>
        <option value="75"></option>
        <option value="100"></option>
      `
    ),
  args: {
    type: 'range',
    label: 'Slider',
  },
};

export const ResetForm: Story = {
  render: args => html`
    <form>
      ${template(args)}
      <button type="reset">Reset</button>
    </form>
  `,
  args: {
    value: 'test',
  },
};
