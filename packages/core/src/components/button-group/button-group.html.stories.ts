import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreButtonGroup } from './index.js';
import '../divider/index.js';
import '../menu/index.js';
import '../menu-item/index.js';
import '../tooltip/index.js';
import '../button-group-overflow/index.js';
import '../overflow/index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-button-group');

const meta: Meta<CoreButtonGroup> = {
  title: 'Core/ButtonGroup',
  component: 'ch-button-group',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreButtonGroup & typeof args>;

export const Default: Story = {
  args: {},
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const Overflow: Story = {
  args: {},
  render: args =>
    template(
      args,
      html`
        <ch-overflow>
          <ch-button>First</ch-button>
          <ch-button>Inner</ch-button>
          <ch-button>Inner</ch-button>
          <ch-button>Inner</ch-button>
          <ch-button>Inner</ch-button>
          <ch-menu>
            <ch-button slot="trigger">Menu</ch-button>
            <ch-menu-item>Item 1</ch-menu-item>
            <ch-menu-item>Item 2</ch-menu-item>
            <ch-menu-item>Item 3</ch-menu-item>
          </ch-menu>
          <ch-button>Inner</ch-button>
          <ch-button>Last</ch-button>
        </ch-overflow>
      `
    ),
};

export const Vertical: Story = {
  args: {
    vertical: true,
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const Link: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button href="https://fluent2.microsoft.design/components/web/react/button/code" target="_blank"
          >First</ch-button
        >
        <ch-button href="https://fluent2.microsoft.design/components/web/react/button/code" target="_blank"
          >Center</ch-button
        >
        <ch-button href="https://fluent2.microsoft.design/components/web/react/button/code" target="_blank"
          >Last</ch-button
        >
      `
    ),
};

export const LinkVertical: Story = {
  args: {
    vertical: true,
  },
  render: args =>
    template(
      args,
      html`
        <ch-button href="https://fluent2.microsoft.design/components/web/react/button/code" target="_blank"
          >First</ch-button
        >
        <ch-button href="https://fluent2.microsoft.design/components/web/react/button/code" target="_blank"
          >Center</ch-button
        >
        <ch-button href="https://fluent2.microsoft.design/components/web/react/button/code" target="_blank"
          >Last</ch-button
        >
      `
    ),
};

export const IconOnly: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button>
          <ch-icon name="person" label="First"></ch-icon>
        </ch-button>
        <ch-button>
          <ch-icon name="more" label="Inner"></ch-icon>
        </ch-button>
        <ch-button>
          <ch-icon name="dismiss" label="Last"></ch-icon>
        </ch-button>
      `
    ),
};

export const Menu: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button>Button</ch-button>
        <ch-button>Button</ch-button>
        <ch-menu>
          <ch-button slot="trigger">Menu</ch-button>
          <ch-menu-item>Item 1</ch-menu-item>
          <ch-menu-item>Item 2</ch-menu-item>
          <ch-menu-item>Item 3</ch-menu-item>
        </ch-menu>
      `
    ),
};

export const Gap: Story = {
  args: {
    '--button-group-gap': '10px',
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const SplitButton: Story = {
  args: { split: true },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Accept</ch-button>
        <ch-menu>
          <ch-button slot="trigger"
            ><ch-icon name="chevron-down" label="First" slot="start"></ch-icon>Dropdown</ch-button
          >
          <ch-menu-item>Item 1</ch-menu-item>
          <ch-menu-item>Item 2</ch-menu-item>
          <ch-menu-item>Item 3</ch-menu-item>
        </ch-menu>
      `
    ),
};

export const SplitButtonWithTooltips: Story = {
  args: {},
  render: () => html`
    <ch-button-group split>
      <ch-tooltip content="First tooltip">
        <ch-button id="first-button">First</ch-button>
      </ch-tooltip>
      <ch-button>Inner</ch-button>
      <ch-button id="middle-button">Inner</ch-button>
      <ch-tooltip anchor="middle-button" content="Another tooltip"></ch-tooltip>
      <ch-button>Last</ch-button>
      <ch-tooltip anchor="menu-button" distance="12" content="Menu tooltip"></ch-tooltip>
      <ch-menu>
        <ch-button id="menu-button" slot="trigger">Menu</ch-button>
        <ch-menu-item>Item 1</ch-menu-item>
        <ch-menu-item>Item 2</ch-menu-item>
        <ch-menu-item>Item 3</ch-menu-item>
      </ch-menu>
    </ch-button-group>
  `,
};

export const SplitButtonVertical: Story = {
  args: {
    split: true,
    vertical: true,
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Accept</ch-button>
        <ch-menu>
          <ch-button slot="trigger"><ch-icon name="chevron-down" label="First"></ch-icon>Dropdown</ch-button>
          <ch-menu-item>Item 1</ch-menu-item>
          <ch-menu-item>Item 2</ch-menu-item>
          <ch-menu-item>Item 3</ch-menu-item>
        </ch-menu>
      `
    ),
};

export const SelectSingle: Story = {
  args: {
    select: 'single',
    '--button-pressed-bg-color': 'var(--button-active-bg-color)',
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const SelectMultiple: Story = {
  args: {
    select: 'multiple',
    '--button-pressed-bg-color': 'var(--button-active-bg-color)',
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const Toolbar: Story = {
  args: {
    toolbar: true,
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const ToolbarWithTooltip: Story = {
  args: {
    toolbar: true,
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-tooltip anchor="toolbar-button" content="This is a tooltip"></ch-tooltip>
        <ch-button id="toolbar-button">Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const NestedToolbar: Story = {
  render: () => html`
    <ch-button-group toolbar>
      <ch-button-group>
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      </ch-button-group>
      <ch-button-group>
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      </ch-button-group>
    </ch-button-group>
  `,
};

export const NestedToolbarWithOverflow: Story = {
  render: () => html`
    <ch-button-group toolbar>
      <ch-button-group-overflow>
        <ch-button-group>
          <ch-button>First</ch-button>
          <ch-button>Inner</ch-button>
          <ch-button>Inner</ch-button>
          <ch-button>Last</ch-button>
        </ch-button-group>
        <ch-divider orientation="vertical" style="--divider-vertical-min-height: 20px; padding: 0 10px;"></ch-divider>
        <ch-button-group>
          <ch-button>First</ch-button>
          <ch-button>Inner</ch-button>
          <ch-menu>
            <ch-button slot="trigger">Menu</ch-button>
            <ch-menu-item>Item 1</ch-menu-item>
            <ch-menu-item>Item 2</ch-menu-item>
            <ch-menu-item>Item 3</ch-menu-item>
          </ch-menu>
          <ch-button>Last</ch-button>
        </ch-button-group>
        <ch-divider orientation="vertical" style="--divider-vertical-min-height: 20px; padding: 0 10px;"></ch-divider>
        <ch-button-group>
          <ch-button>First</ch-button>
          <ch-button>Inner</ch-button>
          <ch-button>Inner</ch-button>
          <ch-button>Last</ch-button>
        </ch-button-group>
      </ch-button-group-overflow>
    </ch-button-group>
  `,
};

export const ToolbarSplitButton: Story = {
  args: {
    toolbar: true,
    split: true,
    '--button-group-divider-height': '60%',
    '--button-group-divider-color': 'white',
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const ToolbarSplitButtonSelect: Story = {
  args: {
    toolbar: true,
    split: true,
    select: 'multiple',
    '--button-group-divider-height': '60%',
    '--button-group-divider-color': 'white',
    '--button-pressed-bg-color': 'var(--button-active-bg-color)',
    '--button-pressed-border': 'var(--button-pressed-bg-color) var(--default-border-size) var(--default-border-style)',
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const NestedToolbarSplitButtonSelect: Story = {
  render: () =>
    html` <style>
        ch-button-group {
          --button-group-divider-height: 60%;
          --button-group-divider-color: white;
          --button-pressed-bg-color: var(--button-active-bg-color);
          --button-pressed-border: var(--button-pressed-bg-color) var(--default-border-size) var(--default-border-style);
          --divider-vertical-min-height: 20px;
        }
      </style>
      <ch-button-group toolbar style="--button-group-gap: 4px">
        <ch-button-group split select="single">
          <ch-button>First</ch-button>
          <ch-button>Inner</ch-button>
          <ch-button>Last</ch-button>
        </ch-button-group>
        <ch-divider orientation="vertical" style="width: auto;"></ch-divider>
        <ch-button-group split select="multiple">
          <ch-button>First</ch-button>
          <ch-button>Inner</ch-button>
          <ch-button>Last</ch-button>
        </ch-button-group>
      </ch-button-group>`,
};

export const LongText: Story = {
  args: {},
  render: args =>
    template(
      args,
      html`
        <ch-button>First button with long text that is not constrained by parent context width</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const LongTextWrap: Story = {
  args: {
    style: 'width: 600px;',
  },

  render: args =>
    template(
      args,
      html`
        <ch-button>First Button text will wrap when it reaches the maximum width of its parent context.</ch-button>
        <ch-button>Inner Button text will wrap when it reaches the maximum width of its parent context.</ch-button>
        <ch-button>Inner Button text will wrap when it reaches the maximum width of its parent context.</ch-button>
        <ch-button>Last Button text will wrap when it reaches the maximum width of its parent context.</ch-button>
      `
    ),
};

export const LongTextVertical: Story = {
  args: {
    vertical: true,
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First button with long text that is not constrained by parent context width</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Inner</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const LongTextVerticalWrap: Story = {
  args: {
    vertical: true,
    style: 'width: 200px;',
  },
  render: args =>
    template(
      args,
      html`
        <ch-button>First Button text will wrap when it reaches the maximum width of its parent context.</ch-button>
        <ch-button>Inner Button text will wrap when it reaches the maximum width of its parent context.</ch-button>
        <ch-button>Inner Button text will wrap when it reaches the maximum width of its parent context.</ch-button>
        <ch-button>Last Button text will wrap when it reaches the maximum width of its parent context.</ch-button>
      `
    ),
};
