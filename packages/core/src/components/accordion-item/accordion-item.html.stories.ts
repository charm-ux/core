import { StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import '../icon/index.js';
import type { CoreAccordionItem } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-accordion-item');

export default {
  title: 'Core/Accordion Item',
  component: 'ch-accordion-item',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

type Story = StoryObj<CoreAccordionItem & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    'heading-slot': 'Accordion item summary',
    'default-slot': 'Accordion item details',
  },
};

export const HeadingLevel: Story = {
  render: args =>
    template(
      args,
      html`
        <span slot="heading">H2 accordion item summary</span>
        Accordion item details
      `
    ),
  args: {
    headingLevel: 2,
  },
};

export const WithSlottedStartAndEnd: Story = {
  render: args =>
    template(
      args,
      html`
        <span slot="heading">Accordion Item Summary</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="18" slot="start">
          <path
            d="M640 896q-27 0-50-10t-40-27-28-41-10-50q0-27 10-50t27-40 41-28 50-10q27 0 50 10t40 27 28 41 10 50q0 27-10 50t-27 40-41 28-50 10zm768 0q-27 0-50-10t-40-27-28-41-10-50q0-27 10-50t27-40 41-28 50-10q27 0 50 10t40 27 28 41 10 50q0 27-10 50t-27 40-41 28-50 10zM1024 0q141 0 272 36t245 103 207 160 160 208 103 245 37 272q0 141-36 272t-103 245-160 207-208 160-245 103-272 37q-141 0-272-36t-245-103-207-160-160-208-103-244-37-273q0-141 36-272t103-245 160-207 208-160T751 37t273-37zm0 1920q123 0 237-32t214-90 182-141 140-181 91-214 32-238q0-123-32-237t-90-214-141-182-181-140-214-91-238-32q-123 0-237 32t-214 90-182 141-140 181-91 214-32 238q0 123 32 237t90 214 141 182 181 140 214 91 238 32zm0-384q73 0 141-20t128-57 106-90 81-118l115 58q-41 81-101 147t-134 112-159 71-177 25q-92 0-177-25t-159-71-134-112-101-147l115-58q33 65 80 118t107 90 127 57 142 20z"
          />
        </svg>
        <ch-icon slot="end" name="person"></ch-icon>
        Accordion Item Content
      `
    ),
};

export const DefaultOpen: Story = {
  render: args =>
    template(
      args,
      html`
        <span slot="heading">Accordion Item Default Open</span>
        Accordion item details
      `
    ),
  args: {
    open: true,
  },
};

export const Disabled: Story = {
  render: args =>
    template(
      args,
      html`
        <span slot="heading">Accordion Item Disabled</span>
        Accordion item details
      `
    ),
  args: {
    disabled: true,
  },
};

export const WithAnimation: Story = {
  render: args =>
    template(
      args,
      html`
        <span slot="heading">Accordion Item Summary</span>
        <p>Accordion item details</p>
      `
    ),
  args: {
    animated: true,
  },
};
