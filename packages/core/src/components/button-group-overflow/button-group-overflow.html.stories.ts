import { html } from 'lit';
import { StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import { CoreButtonGroupOverflow } from './index.js';
import '../button/index.js';
import '../divider/index.js';

const { args, argTypes, events } = getStorybookHelpers('ch-button-group-overflow');

export default {
  title: 'Core/Button Group Overflow',
  component: 'ch-button-group-overflow',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

type Story = StoryObj<CoreButtonGroupOverflow & typeof args>;

// Default button group overflow
export const Default: Story = {
  render: () => html`
    <ch-button-group-overflow style="max-width: 400px;">
      <ch-button>Button 1</ch-button>
      <ch-button>Button 2</ch-button>
      <ch-button>Button 3</ch-button>
      <ch-button>Button 4</ch-button>
      <ch-button>Button 5</ch-button>
      <ch-button>Button 6</ch-button>
    </ch-button-group-overflow>
  `,
};

// Button group overflow with divider
export const WithDivider: Story = {
  render: () => html`
    <ch-button-group-overflow style="max-width: 350px;">
      <ch-button>Edit</ch-button>
      <ch-button>Copy</ch-button>
      <ch-divider></ch-divider>
      <ch-button>Delete</ch-button>
      <ch-button>Archive</ch-button>
    </ch-button-group-overflow>
  `,
};

// Button group overflow - narrow container
export const NarrowContainer: Story = {
  render: () => html`
    <ch-button-group-overflow style="max-width: 200px;">
      <ch-button>Action 1</ch-button>
      <ch-button>Action 2</ch-button>
      <ch-button>Action 3</ch-button>
      <ch-button>Action 4</ch-button>
    </ch-button-group-overflow>
  `,
};

// Button group overflow - wide container (no overflow)
export const WideContainer: Story = {
  render: () => html`
    <ch-button-group-overflow style="max-width: 800px;">
      <ch-button>Button 1</ch-button>
      <ch-button>Button 2</ch-button>
      <ch-button>Button 3</ch-button>
    </ch-button-group-overflow>
  `,
};
