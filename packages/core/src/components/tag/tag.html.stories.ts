import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import './index.js';
import '../icon/index.js';
import type { CoreTag } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-tag');

const meta: Meta<CoreTag> = {
  title: 'Core/Tag',
  component: 'ch-tag',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreTag & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Design',
  },
};

export const Removable: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Design',
    removable: true,
    value: 'design',
  },
};

export const RemovableWithListener: Story = {
  render: () => html`
    <p>Click the remove button, or focus a tag and press Delete or Backspace.</p>
    <div
      style="display: flex; gap: 8px; flex-wrap: wrap;"
      @tag-remove=${(event: CustomEvent) => (event.target as HTMLElement).remove()}
    >
      <ch-tag removable value="design">Design</ch-tag>
      <ch-tag removable value="engineering">Engineering</ch-tag>
      <ch-tag removable value="research">Research</ch-tag>
    </div>
  `,
};

export const Selected: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Design',
    selected: true,
  },
};

export const Disabled: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Design',
    removable: true,
    disabled: true,
  },
};

export const WithStartIcon: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Verified',
    'start-slot': '<ch-icon slot="start" name="checkmark-circle"></ch-icon>',
    removable: true,
  },
};

export const TranslatedRemoveLabel: Story = {
  render: args => template(args),
  args: {
    'default-slot': 'Diseño',
    'remove-label-slot': '<span slot="remove-label">Quitar</span>',
    removable: true,
  },
};

export const RightToLeft: Story = {
  render: () => html`
    <div dir="rtl" style="display: flex; gap: 8px; flex-wrap: wrap;">
      <ch-tag removable>
        <ch-icon slot="start" name="checkmark-circle"></ch-icon>
        تصميم
        <span slot="remove-label">إزالة</span>
      </ch-tag>
      <ch-tag selected>هندسة</ch-tag>
      <ch-tag disabled removable>بحث</ch-tag>
    </div>
  `,
};
