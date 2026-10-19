import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreCalendar } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-calendar');

const meta: Meta<CoreCalendar> = {
  title: 'Core/Calendar',
  component: 'ch-calendar',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreCalendar & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    focusDate: '2026-10-18',
  },
};

export const DateRange: Story = {
  render: args => template(args),
  args: {
    focusDate: '2025-06-15',
    selectionMode: 'range',
    value: '2025-06-10/2025-06-15',
  },
};

export const MultipleDates: Story = {
  render: args => template(args),
  args: {
    focusDate: '2025-06-15',
    selectionMode: 'multiple',
    value: '2025-06-10,2025-06-15',
  },
};

export const UnavailableDates: Story = {
  render: args => template(args),
  args: {
    focusDate: '2025-06-15',
    disabledDates: '2025-06-12 2025-06-19',
    disabledWeekDays: '0,6',
  },
};

export const Localized: Story = {
  render: args => template(args),
  args: {
    focusDate: '2025-06-15',
    locale: 'fr-FR',
    firstDayOfWeek: 1,
  },
};
