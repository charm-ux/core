import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import '../icon/index.js';
import '../badge/index.js';
import type { CoreButton } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-button');

const meta: Meta<CoreButton> = {
  title: 'Core/Button',
  component: 'ch-button',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreButton & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Button',
  },
};

export const IconOnly: Story = {
  render: args => template(args),
  args: {
    'icon-only': true,
    'default-slot': `<ch-icon name="person" label="person"></ch-icon>`,
  },
};

export const StartIcon: Story = {
  render: args => template(args),
  args: {
    '--button-content-gap': '8px',
    'default-slot': 'With icon before content',
    'start-slot': `<ch-icon name="person"></ch-icon>`,
  },
};

export const EndIcon: Story = {
  render: args => template(args),
  args: {
    '--button-content-gap': '8px',
    'default-slot': 'With icon after content',
    'end-slot': `<ch-icon name="person"></ch-icon>`,
  },
};

export const StartEndIcon: Story = {
  render: args => template(args),
  args: {
    '--button-content-gap': '8px',
    'start-slot': `<ch-badge>PDF</ch-badge>`,
    'default-slot': 'quarterly_report.pdf',
    'end-slot': `<span>2.4MB</span>`,
  },
};

export const MultiIcons: Story = {
  render: args => html`
    <ch-button> <ch-icon name="person" label="person" slot="start"></ch-icon>A button</ch-button>
    <ch-button> <ch-icon name="person" label="person" slot="start"></ch-icon>B button</ch-button>
    <ch-button> <ch-icon name="person" label="person" slot="end"></ch-icon>C button</ch-button>
    <ch-button> <ch-icon name="person" label="person" slot="start"></ch-icon>D button</ch-button>
    <ch-button> E button</ch-button>
  `,
};

export const LinkEndSlot: Story = {
  render: args => template(args, html`<ch-icon name="person" slot="end"></ch-icon>`),
  args: {
    'default-slot': 'Link with end slot',
    href: 'https://fluent2.microsoft.design/components/web/react/button/code',
    target: '_blank',
  },
};

export const Toggle: Story = {
  render: args =>
    html` ${template(args)}
      <style>
        [button] {
          --button-pressed-bg-color: darkgrey;
          --button-pressed-hover-bg-color: grey;
          --button-pressed-active-bg-color: white;
        }
      </style>`,
  args: {
    'default-slot': 'Toggle',
    toggle: true,
  },
};

export const Link: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Link',
    href: 'https://fluent2.microsoft.design/components/web/react/button/code',
    target: '_blank',
  },
};

export const LinkInContext: Story = {
  render: args => html`
    <p>
      Lorem ipsum dolor sit amet,
      <ch-button href="https://microsoft.com">an example button link</ch-button> consectetur adipiscing elit. Duis
      consectetur ultricies accumsan.
    </p>
  `,
};

export const LongText: Story = {
  render: args => html`<div style="max-width: 280px;">${template(args)}</div>`,
  args: {
    'default-slot': 'Button text will wrap when it reaches the maximum width of its parent context.',
  },
};
