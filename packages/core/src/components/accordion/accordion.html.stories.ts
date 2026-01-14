import { StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import '../accordion-item/index.js';
import './index.js';
import type { CoreAccordion } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-accordion');

export default {
  title: 'Core/Accordion',
  component: 'ch-accordion',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

type Story = StoryObj<CoreAccordion & typeof args>;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-accordion-item>
          <span slot="heading">Panel One</span>
          Content One
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Two</span>
          Content Two
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Three</span>
          Content Three
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Four</span>
          Content Four
        </ch-accordion-item>
      `
    ),
};

export const Single: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-accordion-item>
          <span slot="heading">Panel One</span>
          Content One
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Two</span>
          Content Two
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Three</span>
          Content Three
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Four</span>
          Content Four
        </ch-accordion-item>
      `
    ),
  args: {
    'open-single': true,
  },
};

export const WithStartAndEndSlot: Story = {
  render: args => {
    return template(
      args,
      html`
        <ch-accordion-item>
          <span slot="heading">With Start slot</span>
          Accordion Content One
          <span slot="start" style="font-size: 20px;">😀</span>
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">With End slot</span>
          <span slot="end" style="font-size: 20px;">😀</span>
          Accordion Content Two
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">With both Start and End slot</span>
          <span slot="start" style="font-size: 20px;">😀</span>
          <span slot="end" style="font-size: 20px;">😀</span>
          Accordion Content Three
        </ch-accordion-item>
      `
    );
  },
};

export const DefaultOpen: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-accordion-item>
          <span slot="heading">Panel One</span>
          Content One
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Two</span>
          Content Two
        </ch-accordion-item>
        <ch-accordion-item open>
          <span slot="heading">Panel Three</span>
          Content Three
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Four</span>
          Content Four
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Five</span>
          Content Five
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Six</span>
          Content Six
        </ch-accordion-item>
      `
    ),
};

export const Disabled: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-accordion-item disabled>
          <span slot="heading">Panel One</span>
          Content One
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Two</span>
          Content Two
        </ch-accordion-item>
        <ch-accordion-item disabled>
          <span slot="heading">Panel Three</span>
          Content Three
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Four</span>
          Content Four
        </ch-accordion-item>
        <ch-accordion-item>
          <span slot="heading">Panel Five</span>
          Content Five
        </ch-accordion-item>
        <ch-accordion-item disabled>
          <span slot="heading">Panel Six</span>
          Content Six
        </ch-accordion-item>
      `
    ),
};

export const ExpandIconPosition: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-accordion-item expand-icon-position="end">
          <span slot="heading">Accordion Header 1</span>
          <div>Accordion Panel 1</div>
        </ch-accordion-item>
        <ch-accordion-item expand-icon-position="start">
          <span slot="heading">Accordion Header 2</span>
          <div>Accordion Panel 2</div>
        </ch-accordion-item>
      `
    ),
};
