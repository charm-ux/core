import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import '../menu-group/index.js';
import '../menu-item/index.js';
import '../button/index.js';
import './index.js';
import type { CoreMenu } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-menu');

const meta: Meta<CoreMenu> = {
  title: 'Core/Menu',
  component: 'ch-menu',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreMenu & typeof args>;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`<ch-button slot="trigger">click me</ch-button>
        <ch-menu-item>Item 1</ch-menu-item>
        <ch-menu-item>Item 2</ch-menu-item>
        <ch-menu-item>Item 3</ch-menu-item> `
    ),
};

export const AnchorMenuItems: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button slot="trigger">click me</ch-button>
        <ch-menu-item href="https://bing.com" target="_blank">Item 1</ch-menu-item>
        <ch-menu-item href="https://bing.com" target="_blank">Item 2</ch-menu-item>
        <ch-menu-item href="https://bing.com" target="_blank">Item 3</ch-menu-item>
      `
    ),
};

export const InitiallyOpen: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button slot="trigger">click me</ch-button>
        <ch-menu-item>Item 1</ch-menu-item>
        <ch-menu-item>Item 2</ch-menu-item>
        <ch-menu-item>Item 3</ch-menu-item>
      `
    ),
  args: {
    open: true,
  },
};

export const WithSubmenu: Story = {
  render: args =>
    template(
      args,
      html`<ch-button slot="trigger">click me</ch-button>
        <ch-menu-item>Item 1</ch-menu-item>
        <ch-menu-item>Item 2</ch-menu-item>
        <ch-menu-item>
          Item 3
          <ch-menu-item>Submenu item 1</ch-menu-item>
          <ch-menu-item>Submenu item 2</ch-menu-item>
          <ch-menu-item>Submenu item 3</ch-menu-item>
        </ch-menu-item> `
    ),
};

export const GroupHeading: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button slot="trigger">click me</ch-button>
        <ch-menu-group heading="Group heading">
          <ch-menu-item>Item 1</ch-menu-item>
          <ch-menu-item>Item 2</ch-menu-item>
          <ch-menu-item>Item 3</ch-menu-item>
        </ch-menu-group>
      `
    ),
};

export const CheckboxMenuItems: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button slot="trigger">click me</ch-button>
        <ch-menu-group select="multiple">
          <ch-menu-item>Item 1</ch-menu-item>
          <ch-menu-item>Item 2</ch-menu-item>
          <ch-menu-item>Item 3</ch-menu-item>
        </ch-menu-group>
      `
    ),
};

export const RadioMenuItems: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button slot="trigger">click me</ch-button>
        <ch-menu-group select="single">
          <ch-menu-item>Item 1</ch-menu-item>
          <ch-menu-item>Item 2</ch-menu-item>
          <ch-menu-item>Item 3</ch-menu-item>
        </ch-menu-group>
      `
    ),
};
