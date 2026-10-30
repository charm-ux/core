import { html, type TemplateResult } from 'lit';
import { StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import { CoreButtonGroupOverflow } from './index.js';
import '../button/index.js';
import '../button-group/index.js';
import '../divider/index.js';
import '../icon/index.js';
import '../menu/index.js';
import '../menu-item/index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-button-group-overflow');

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

const renderScenario = (storyArgs: typeof args, maxWidth: string, content: TemplateResult) =>
  html`<div style="max-width: ${maxWidth};">${template(storyArgs, content)}</div>`;

// Default button group overflow
export const Default: Story = {
  render: args =>
    html`<div style="max-width: 400px;">
      ${template(
        args,
        html`
          <ch-button>Button 1</ch-button>
          <ch-button>Button 2</ch-button>
          <ch-button>Button 3</ch-button>
          <ch-button>Button 4</ch-button>
          <ch-button>Button 5</ch-button>
          <ch-button>Button 6</ch-button>
        `
      )}
    </div>`,
};

// Button group overflow with divider
export const WithDivider: Story = {
  render: args =>
    html`<div style="max-width: 350px;">
      ${template(
        args,
        html`
          <ch-button>Edit</ch-button>
          <ch-button>Copy</ch-button>
          <ch-divider></ch-divider>
          <ch-button>Delete</ch-button>
          <ch-button>Archive</ch-button>
        `
      )}
    </div>`,
};

// Button group overflow - narrow container
export const NarrowContainer: Story = {
  render: args =>
    html`<div style="max-width: 200px;">
      ${template(
        args,
        html`
          <ch-button>Action 1</ch-button>
          <ch-button>Action 2</ch-button>
          <ch-button>Action 3</ch-button>
          <ch-button>Action 4</ch-button>
        `
      )}
    </div>`,
};

// Button group overflow - wide container (no overflow)
export const WideContainer: Story = {
  render: args =>
    html`<div style="max-width: 800px;">
      ${template(
        args,
        html`
          <ch-button>Button 1</ch-button>
          <ch-button>Button 2</ch-button>
          <ch-button>Button 3</ch-button>
        `
      )}
    </div>`,
};

export const ApplicationNavigation: Story = {
  args: {
    label: 'More navigation',
    min: 1,
    'overflow-direction': 'end',
  },
  render: args =>
    renderScenario(
      args,
      '360px',
      html`
        <ch-button>Overview</ch-button>
        <ch-button>Projects</ch-button>
        <ch-button>Teams</ch-button>
        <ch-button>Reports</ch-button>
        <ch-button>Settings</ch-button>
      `
    ),
};

export const EditorToolbar: Story = {
  args: {
    label: 'More editor actions',
  },
  render: args =>
    renderScenario(
      args,
      '420px',
      html`
        <ch-button-group>
          <ch-button toggle>Bold</ch-button>
          <ch-button toggle>Italic</ch-button>
          <ch-button toggle>Underline</ch-button>
        </ch-button-group>
        <ch-divider></ch-divider>
        <ch-button-group>
          <ch-button>Align left</ch-button>
          <ch-button>Align center</ch-button>
          <ch-button>Align right</ch-button>
        </ch-button-group>
        <ch-menu>
          <ch-button slot="trigger">Insert</ch-button>
          <ch-menu-item>Image</ch-menu-item>
          <ch-menu-item>Link</ch-menu-item>
          <ch-menu-item>Table</ch-menu-item>
        </ch-menu>
      `
    ),
};

export const FileActions: Story = {
  args: {
    label: 'More file actions',
    min: 2,
  },
  render: args =>
    renderScenario(
      args,
      '340px',
      html`
        <ch-button>Open</ch-button>
        <ch-button>Share</ch-button>
        <ch-button>Download</ch-button>
        <ch-divider></ch-divider>
        <ch-button>Duplicate</ch-button>
        <ch-button>Move</ch-button>
        <ch-button disabled>Delete unavailable</ch-button>
      `
    ),
};

export const OverflowFromStart: Story = {
  args: {
    label: 'More earlier actions',
    min: 1,
    'menu-position': 'start',
    'overflow-direction': 'start',
  },
  render: args =>
    renderScenario(
      args,
      '300px',
      html`
        <ch-button>First</ch-button>
        <ch-button>Second</ch-button>
        <ch-button>Third</ch-button>
        <ch-button>Fourth</ch-button>
        <ch-button>Last</ch-button>
      `
    ),
};

export const IconOnlyActions: Story = {
  args: {
    label: 'More actions',
  },
  render: args =>
    renderScenario(
      args,
      '180px',
      html`
        <ch-button icon-only><ch-icon name="person" label="Profile"></ch-icon></ch-button>
        <ch-button icon-only><ch-icon name="more" label="More details"></ch-icon></ch-button>
        <ch-button icon-only><ch-icon name="dismiss" label="Close"></ch-icon></ch-button>
        <ch-button icon-only><ch-icon name="checkmark" label="Confirm"></ch-icon></ch-button>
      `
    ),
};
