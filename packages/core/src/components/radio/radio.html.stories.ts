import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import { html } from 'lit/static-html.js';
import type { CoreRadio } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-radio');

const meta: Meta<CoreRadio> = {
  title: 'Core/Radio',
  component: 'ch-radio',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreRadio & typeof args>;

export const LabelSlot: Story = {
  render: args =>
    template(
      args,
      html`
        Banana
        <br />
        <div>
          <ch-icon name="warning"></ch-icon>
          <span class="subtext">This is an example subtext of the first option</span>
        </div>
      `
    ),
};

export const Checked: Story = {
  render: args => template(args, html` Text`),
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  render: args => template(args),
  args: {
    label: 'Disabled',
    disabled: true,
  },
};
