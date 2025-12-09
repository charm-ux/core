import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import '../menu/index.js';
import '../menu-item/index.js';
import '../checkbox/index.js';
import '../radio/index.js';
import './index.js';
import type { CoreMenuGroup } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-menu-group');

const meta: Meta<CoreMenuGroup> = {
  title: 'Core/MenuGroup',
  component: 'ch-menu-group',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreMenuGroup & typeof args>;

export const Default: Story = {
  render: args => html`
    <div role="menu">
      ${template(
        args,
        html`
          <ch-menu-item>Menu Item 1</ch-menu-item>
          <ch-menu-item>Menu Item 2</ch-menu-item>
          <ch-menu-item>Menu Item 3</ch-menu-item>
        `
      )}
    </div>
  `,
  args: {
    heading: 'Group heading',
  },
};

export const WithSlotHeading: Story = {
  render: args => html`
    <div role="menu">
      ${template(
        args,
        html`
          <div slot="heading">Slotted heading</div>
          <ch-menu-item>Menu Item 1</ch-menu-item>
          <ch-menu-item>Menu Item 2</ch-menu-item>
          <ch-menu-item>Menu Item 3</ch-menu-item>
        `
      )}
    </div>
  `,
};

export const SingleSelection: Story = {
  render: args => html`
    <div role="menu">
      ${template(
        args,
        html`
          <ch-menu-item>Menu Item 1</ch-menu-item>
          <ch-menu-item>Menu Item 2</ch-menu-item>
          <ch-menu-item>Menu Item 3</ch-menu-item>
        `
      )}
    </div>
  `,
  args: {
    heading: 'Select One',
    select: 'single',
  },
};

export const MultipleSelection: Story = {
  render: args => html`
    <div role="menu">
      ${template(
        args,
        html`
          <ch-menu-item>Menu Item 1</ch-menu-item>
          <ch-menu-item>Menu Item 2</ch-menu-item>
          <ch-menu-item>Menu Item 3</ch-menu-item>
        `
      )}
    </div>
  `,
  args: {
    heading: 'Select One',
    select: 'multiple',
  },
};
