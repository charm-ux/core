import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreDatePicker } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-date-picker');

const meta: Meta<CoreDatePicker> = {
  title: 'Core/Date Picker',
  component: 'ch-date-picker',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreDatePicker & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    label: 'Date',
    focusDate: '2026-10-18',
  },
};

export const WithValue: Story = {
  render: args => template(args),
  args: {
    label: 'Date',
    value: '2026-10-18',
  },
};

export const WithUnavailableDates: Story = {
  render: args => template(args),
  args: {
    label: 'Date',
    focusDate: '2025-06-15',
    min: '2025-06-01',
    max: '2025-06-30',
    disabledDates: '2025-06-12 2025-06-19',
    disabledWeekDays: '0,6',
  },
};

export const Required: Story = {
  render: args => template(args),
  args: {
    label: 'Required date',
    required: true,
  },
};

export const Readonly: Story = {
  render: args => template(args),
  args: {
    label: 'Readonly date',
    value: '2026-10-18',
    readonly: true,
  },
};

export const Disabled: Story = {
  render: args => template(args),
  args: {
    label: 'Disabled date',
    value: '2026-10-18',
    disabled: true,
  },
};

export const Invalid: Story = {
  render: args => template(args),
  args: {
    label: 'Invalid date',
    value: '2026-10-18',
    errorMessage: 'Choose an available date.',
  },
};

export const RightToLeft: Story = {
  render: args => template(args),
  args: {
    label: 'التاريخ',
    value: '2026-10-18',
    dir: 'rtl',
  },
};

export const Clearable: Story = {
  render: args => template(args),
  args: {
    label: 'Date',
    value: '2025-06-15',
  },
};

export const StartAndEndSlots: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-icon slot="start" name="calendar"></ch-icon>
        <span slot="end">UTC</span>
      `
    ),
  args: {
    label: 'Date',
  },
};

export const FooterActions: Story = {
  render: args => template(args),
  args: {
    label: 'Date',
    value: '2025-06-15',
  },
};
