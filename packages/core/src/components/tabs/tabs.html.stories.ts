import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import './index.js';
import '../tab/index.js';
import '../tab-panel/index.js';
import type { CoreTabs } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-tabs');

const meta: Meta<CoreTabs> = {
  title: 'Core/Tabs',
  component: 'ch-tabs',
  args,
  argTypes,
  parameters: {
    actions: {
      // Include panel events in the actions panel
      handles: [...events, 'tab-show', 'tab-hide', 'tab-after-show', 'tab-after-hide'],
    },
  },
};

export default meta;

type Story = StoryObj<CoreTabs & typeof args>;

export const Default: Story = {
  render: args =>
    html`${template(
      args,
      html` <ch-tab>one</ch-tab>
        <ch-tab>two</ch-tab>
        <ch-tab>three</ch-tab>
        <ch-tab>four</ch-tab>`
    )}`,
};

export const DisabledTabs: Story = {
  render: args =>
    html`${template(
      args,
      html` <ch-tab disabled>one disabled</ch-tab>
        <ch-tab>two</ch-tab>
        <ch-tab>three</ch-tab>
        <ch-tab disabled>four disabled</ch-tab>

        <ch-tab-panel>panel one</ch-tab-panel>
        <ch-tab-panel>panel two</ch-tab-panel>
        <ch-tab-panel>panel three</ch-tab-panel>
        <ch-tab-panel>panel four</ch-tab-panel>`
    )}`,
};

export const AllDisabledTabs: Story = {
  render: args =>
    html`${template(
      args,
      html`
        <ch-tab id="tab-1" disabled>one disabled</ch-tab>
        <ch-tab id="tab-2" disabled>two disabled</ch-tab>
        <ch-tab id="tab-3" disabled>three disabled</ch-tab>
        <ch-tab id="tab-4" disabled>four disabled</ch-tab>
        <ch-tab-panel>panel one</ch-tab-panel>
        <ch-tab-panel>panel two</ch-tab-panel>
        <ch-tab-panel>panel three</ch-tab-panel>
        <ch-tab-panel>panel four</ch-tab-panel>
      `
    )}`,
};

export const Vertical: Story = {
  render: args =>
    html`${template(
      args,
      html` <ch-tab>one</ch-tab>
        <ch-tab>two</ch-tab>
        <ch-tab>three</ch-tab>
        <ch-tab>four</ch-tab>

        <ch-tab-panel>panel one</ch-tab-panel>
        <ch-tab-panel>panel two</ch-tab-panel>
        <ch-tab-panel>panel three</ch-tab-panel>
        <ch-tab-panel>panel four</ch-tab-panel>`
    )}`,
  args: {
    layout: 'vertical',
  },
};

export const Panel: Story = {
  render: args =>
    html`${template(
      args,
      html` <ch-tab>Section A</ch-tab>
        <ch-tab>Section B</ch-tab>
        <ch-tab>Section C</ch-tab>
        <ch-tab>Section D</ch-tab>

        <ch-tab-panel> <button>Demo button 1</button> panel one </ch-tab-panel>
        <ch-tab-panel> <button>Demo button 2</button> panel two </ch-tab-panel>
        <ch-tab-panel> <button>Demo button 3</button> panel three </ch-tab-panel>
        <ch-tab-panel> <button>Demo button 4</button> panel four </ch-tab-panel>`
    )}`,
};

export const ActiveId: Story = {
  render: args =>
    html`${template(
      args,
      html` <ch-tab id="1">one</ch-tab>
        <ch-tab id="2">two</ch-tab>
        <ch-tab id="3">three</ch-tab>
        <ch-tab id="4">four</ch-tab>

        <ch-tab-panel>panel one</ch-tab-panel>
        <ch-tab-panel>panel two</ch-tab-panel>
        <ch-tab-panel>panel three</ch-tab-panel>
        <ch-tab-panel>panel four</ch-tab-panel>`
    )}`,
  args: {
    'active-id': 2,
  },
};
