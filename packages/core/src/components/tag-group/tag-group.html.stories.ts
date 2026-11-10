import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import './index.js';
import '../tag/index.js';
import '../icon/index.js';
import type { CoreTagGroup } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-tag-group');

const meta: Meta<CoreTagGroup> = {
  title: 'Core/Tag Group',
  component: 'ch-tag-group',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreTagGroup & typeof args>;

const tags = `
  <ch-tag value="design">Design</ch-tag>
  <ch-tag value="engineering">Engineering</ch-tag>
  <ch-tag value="research">Research</ch-tag>
  <ch-tag value="marketing" disabled>Marketing</ch-tag>
`;

export const Default: Story = {
  render: args => template(args),
  args: {
    label: 'Teams',
    'default-slot': tags,
  },
};

export const WithHelpText: Story = {
  render: args => template(args),
  args: {
    label: 'Teams',
    'help-text': 'Teams that can see this document.',
    'default-slot': tags,
  },
};

export const Removable: Story = {
  render: () => html`
    <p>Tab to the group, use the arrow keys to move between tags, and press Delete or Backspace to remove one.</p>
    <ch-tag-group label="Teams" @tag-remove=${(event: CustomEvent) => (event.target as HTMLElement).remove()}>
      <ch-tag removable value="design">Design</ch-tag>
      <ch-tag removable value="engineering">Engineering</ch-tag>
      <ch-tag removable value="research">Research</ch-tag>
      <span slot="empty">No teams selected.</span>
    </ch-tag-group>
  `,
};

export const SingleSelection: Story = {
  render: args => template(args),
  args: {
    label: 'Priority',
    selection: 'single',
    value: 'medium',
    'default-slot': `
      <ch-tag value="low">Low</ch-tag>
      <ch-tag value="medium">Medium</ch-tag>
      <ch-tag value="high">High</ch-tag>
    `,
  },
};

export const MultipleSelection: Story = {
  render: args => template(args),
  args: {
    label: 'Filters',
    'help-text': 'Space toggles a filter. Ctrl+A selects all.',
    selection: 'multiple',
    value: 'design,research',
    'default-slot': tags,
  },
};

export const Disabled: Story = {
  render: args => template(args),
  args: {
    label: 'Teams',
    disabled: true,
    selection: 'multiple',
    'default-slot': tags,
  },
};

export const HiddenLabel: Story = {
  render: args => template(args),
  args: {
    label: 'Teams',
    'hide-label': true,
    'default-slot': tags,
  },
};

export const RightToLeft: Story = {
  render: () => html`
    <div dir="rtl">
      <ch-tag-group label="الفرق" selection="multiple">
        <ch-tag removable value="design">تصميم</ch-tag>
        <ch-tag removable value="engineering">هندسة</ch-tag>
        <ch-tag removable value="research">بحث</ch-tag>
      </ch-tag-group>
    </div>
  `,
};
