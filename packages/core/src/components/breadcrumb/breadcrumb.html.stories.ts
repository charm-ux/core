import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import '../icon/index.js';
import '../breadcrumb-item/index.js';
import '../overflow/index.js';
import type { CoreBreadcrumb } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-breadcrumb');

const meta: Meta<CoreBreadcrumb> = {
  title: 'Core/Breadcrumb',
  component: 'ch-breadcrumb',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreBreadcrumb & typeof args>;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-breadcrumb-item>item 1</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 2 which is longer than 30 characters</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 3</ch-breadcrumb-item>
      `
    ),
};

export const CustomSeparator: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-breadcrumb-item>item 1<span slot="separator">|</span></ch-breadcrumb-item>
        <ch-breadcrumb-item>item 2<span slot="separator">|</span></ch-breadcrumb-item>
        <ch-breadcrumb-item>item 3</ch-breadcrumb-item>
      `
    ),
};

export const Link: Story = {
  render: args =>
    template(
      args,
      html`<ch-breadcrumb-item href="#">item 1</ch-breadcrumb-item>
        <ch-breadcrumb-item href="#">item 2</ch-breadcrumb-item>
        <ch-breadcrumb-item href="#">item 3</ch-breadcrumb-item> `
    ),
};

export const StartAndEndSlots: Story = {
  render: args =>
    template(
      args,
      html`<ch-breadcrumb-item
          >item 1<span slot="start"><ch-icon name="person"></ch-icon></span></ch-breadcrumb-item
        ><ch-breadcrumb-item
          >item 2<span slot="end"><ch-icon name="person"></ch-icon></span></ch-breadcrumb-item
        ><ch-breadcrumb-item>item 3</ch-breadcrumb-item> `
    ),
};

export const Tooltip: Story = {
  render: args =>
    template(
      args,
      html`<ch-tooltip arrow content="Item 1 details">
          <ch-breadcrumb-item>item 1</ch-breadcrumb-item>
        </ch-tooltip>
        <ch-breadcrumb-item>item 2</ch-breadcrumb-item><ch-breadcrumb-item>item 3</ch-breadcrumb-item>`
    ),
};

export const LongNames: Story = {
  render: args =>
    template(
      args,
      html` <ch-breadcrumb-item>item 1</ch-breadcrumb-item>
        <ch-tooltip arrow content="Item 2 is long. Don't think about what you want to be, but what you want to do.">
          <ch-breadcrumb-item style="--breadcrumb-item-control-width: 200px;"
            >Item 2 is long. Don't think about what you want to be, but what you want to do.
          </ch-breadcrumb-item>
        </ch-tooltip>
        <ch-breadcrumb-item>item 3</ch-breadcrumb-item><ch-breadcrumb-item>item 4</ch-breadcrumb-item>`
    ),
};

export const Overflow: Story = {
  render: args =>
    template(
      args,
      html` <ch-overflow>
        <ch-breadcrumb-item>item 1</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 2</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 3</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 4</ch-breadcrumb-item>
        <ch-breadcrumb-item href="https://bing.com" target="_blank">item 5</ch-breadcrumb-item>
        <ch-breadcrumb-item href="https://bing.com" target="_blank">item 6</ch-breadcrumb-item>
        <ch-breadcrumb-item href="https://bing.com" target="_blank">item 7</ch-breadcrumb-item>
        <ch-breadcrumb-item href="https://bing.com" target="_blank">item 8</ch-breadcrumb-item>
      </ch-overflow>`
    ),
};
