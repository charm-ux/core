import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreDateRangePicker } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-date-range-picker');

const meta: Meta<CoreDateRangePicker> = {
  title: 'Core/Date Range Picker',
  component: 'ch-date-range-picker',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreDateRangePicker & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    label: 'Date range',
    focusDate: '2026-10-18',
  },
};

export const WithValue: Story = {
  render: args => template(args),
  args: {
    label: 'Date range',
    value: '2026-10-18/2026-10-24',
  },
};

export const WithUnavailableDates: Story = {
  render: args => template(args),
  args: {
    label: 'Date range',
    focusDate: '2025-06-15',
    min: '2025-06-01',
    max: '2025-06-30',
    disabledDates: '2025-06-12 2025-06-19',
    disabledWeekDays: '0,6',
  },
};

export const RangeLengthConstraints: Story = {
  render: args => template(args),
  args: {
    label: 'Date range',
    focusDate: '2025-06-15',
    minRange: 3,
    maxRange: 7,
  },
};

export const Clearable: Story = {
  render: args => template(args),
  args: {
    label: 'Date range',
    value: '2025-06-10/2025-06-15',
  },
};

export const StartAndEndSlots: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-icon slot="start" name="calendar"></ch-icon>
        <span slot="range-separator">to</span>
        <span slot="end">UTC</span>
      `
    ),
  args: {
    label: 'Date range',
  },
};

export const FooterActions: Story = {
  render: args => template(args),
  args: {
    label: 'Date range',
    value: '2025-06-10/2025-06-15',
  },
};
