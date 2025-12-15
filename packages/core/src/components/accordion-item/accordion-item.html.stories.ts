import { StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="18" slot="end">
          <path
            d="M743 569q-45 53-102 128T525 861t-117 184-102 189-72 180-28 156q0 38 10 71l-1 5q-4 0-6-2-51-64-90-138t-65-154-40-163-14-165q0-100 20-200t59-195 96-180 130-154q4-4 15-5t15-2q31 0 67 15t76 39 78 54 74 60 64 59 49 47l1 4-1 3zM305 295h1-1zm1437 0h1-1zm-30-7q5 0 15 1t16 6q73 69 130 154t96 179 59 195 20 201q0 82-13 165t-40 162-66 154-90 139q-2 2-6 2l-1-5q10-33 10-71 0-69-27-155t-72-180-102-190-117-184-117-164-102-129l-1-3 1-1 1-2q19-19 48-47t65-58 73-61 77-54 75-39 68-15zM487 156l2-5Q614 76 746 38t278-38q146 0 277 37t256 113l2 5-5 1q-31-7-68-7-56 0-116 13t-121 36-117 49-106 55l-2 1-2-1q-48-27-105-54t-117-49-120-36-116-14q-18 0-36 1t-36 7l-5-1zM350 1795v-1 1zm677-972q37 28 86 70t106 96 115 114 116 126 107 131 89 128 60 120 22 106q0 23-7 43t-23 38q-21 21-48 41t-52 37q-128 86-274 130t-300 45q-154 0-300-44t-274-131q-25-17-52-37t-48-41q-16-17-23-37t-7-44q0-48 22-105t60-120 88-129 107-131 116-126 116-114 105-95 87-71l3-2 3 2z"
          />
        </svg>
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
