import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import '../breadcrumb-item/index.js';
import '../overflow/index.js';
import type { CoreBreadcrumb } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-breadcrumb');

const meta: Meta<CoreBreadcrumb> = {
  title: 'Core/Breadcrumb',
  component: 'ch-breadcrumb',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreBreadcrumb & typeof args>;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-breadcrumb-item>item 1</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 2 which is longer than 30 characters</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 3</ch-breadcrumb-item>
      `
    ),
};

export const CustomSeparator: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-breadcrumb-item>item 1<span slot="separator">|</span></ch-breadcrumb-item>
        <ch-breadcrumb-item>item 2<span slot="separator">|</span></ch-breadcrumb-item>
        <ch-breadcrumb-item>item 3</ch-breadcrumb-item>
      `
    ),
};

export const Link: Story = {
  render: args =>
    template(
      args,
      html`<ch-breadcrumb-item href="#">item 1</ch-breadcrumb-item>
        <ch-breadcrumb-item href="#">item 2</ch-breadcrumb-item>
        <ch-breadcrumb-item href="#">item 3</ch-breadcrumb-item> `
    ),
};

export const StartAndEndSlots: Story = {
  render: args =>
    template(
      args,
      html`<ch-breadcrumb-item
          >item 1<span slot="start"
            ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="18" height="18">
              <path
                d="M743 569q-45 53-102 128T525 861t-117 184-102 189-72 180-28 156q0 38 10 71l-1 5q-4 0-6-2-51-64-90-138t-65-154-40-163-14-165q0-100 20-200t59-195 96-180 130-154q4-4 15-5t15-2q31 0 67 15t76 39 78 54 74 60 64 59 49 47l1 4-1 3zM305 295h1-1zm1437 0h1-1zm-30-7q5 0 15 1t16 6q73 69 130 154t96 179 59 195 20 201q0 82-13 165t-40 162-66 154-90 139q-2 2-6 2l-1-5q10-33 10-71 0-69-27-155t-72-180-102-190-117-184-117-164-102-129l-1-3 1-1 1-2q19-19 48-47t65-58 73-61 77-54 75-39 68-15zM487 156l2-5Q614 76 746 38t278-38q146 0 277 37t256 113l2 5-5 1q-31-7-68-7-56 0-116 13t-121 36-117 49-106 55l-2 1-2-1q-48-27-105-54t-117-49-120-36-116-14q-18 0-36 1t-36 7l-5-1zM350 1795v-1 1zm677-972q37 28 86 70t106 96 115 114 116 126 107 131 89 128 60 120 22 106q0 23-7 43t-23 38q-21 21-48 41t-52 37q-128 86-274 130t-300 45q-154 0-300-44t-274-131q-25-17-52-37t-48-41q-16-17-23-37t-7-44q0-48 22-105t60-120 88-129 107-131 116-126 116-114 105-95 87-71l3-2 3 2z"
              /></svg></span></ch-breadcrumb-item
        ><ch-breadcrumb-item
          >item 2<span slot="end"
            ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="18" height="18">
              <path
                d="M743 569q-45 53-102 128T525 861t-117 184-102 189-72 180-28 156q0 38 10 71l-1 5q-4 0-6-2-51-64-90-138t-65-154-40-163-14-165q0-100 20-200t59-195 96-180 130-154q4-4 15-5t15-2q31 0 67 15t76 39 78 54 74 60 64 59 49 47l1 4-1 3zM305 295h1-1zm1437 0h1-1zm-30-7q5 0 15 1t16 6q73 69 130 154t96 179 59 195 20 201q0 82-13 165t-40 162-66 154-90 139q-2 2-6 2l-1-5q10-33 10-71 0-69-27-155t-72-180-102-190-117-184-117-164-102-129l-1-3 1-1 1-2q19-19 48-47t65-58 73-61 77-54 75-39 68-15zM487 156l2-5Q614 76 746 38t278-38q146 0 277 37t256 113l2 5-5 1q-31-7-68-7-56 0-116 13t-121 36-117 49-106 55l-2 1-2-1q-48-27-105-54t-117-49-120-36-116-14q-18 0-36 1t-36 7l-5-1zM350 1795v-1 1zm677-972q37 28 86 70t106 96 115 114 116 126 107 131 89 128 60 120 22 106q0 23-7 43t-23 38q-21 21-48 41t-52 37q-128 86-274 130t-300 45q-154 0-300-44t-274-131q-25-17-52-37t-48-41q-16-17-23-37t-7-44q0-48 22-105t60-120 88-129 107-131 116-126 116-114 105-95 87-71l3-2 3 2z"
              /></svg></span></ch-breadcrumb-item
        ><ch-breadcrumb-item>item 3</ch-breadcrumb-item> `
    ),
};

export const Tooltip: Story = {
  render: args =>
    template(
      args,
      html`<ch-tooltip arrow content="Item 1 details">
          <ch-breadcrumb-item>item 1</ch-breadcrumb-item>
        </ch-tooltip>
        <ch-breadcrumb-item>item 2</ch-breadcrumb-item><ch-breadcrumb-item>item 3</ch-breadcrumb-item>`
    ),
};

export const LongNames: Story = {
  render: args =>
    template(
      args,
      html` <ch-breadcrumb-item>item 1</ch-breadcrumb-item>
        <ch-tooltip arrow content="Item 2 is long. Don't think about what you want to be, but what you want to do.">
          <ch-breadcrumb-item style="--breadcrumb-item-control-width: 200px;"
            >Item 2 is long. Don't think about what you want to be, but what you want to do.
          </ch-breadcrumb-item>
        </ch-tooltip>
        <ch-breadcrumb-item>item 3</ch-breadcrumb-item><ch-breadcrumb-item>item 4</ch-breadcrumb-item>`
    ),
};

export const Overflow: Story = {
  render: args =>
    template(
      args,
      html` <ch-overflow>
        <ch-breadcrumb-item>item 1</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 2</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 3</ch-breadcrumb-item>
        <ch-breadcrumb-item>item 4</ch-breadcrumb-item>
        <ch-breadcrumb-item href="https://bing.com" target="_blank">item 5</ch-breadcrumb-item>
        <ch-breadcrumb-item href="https://bing.com" target="_blank">item 6</ch-breadcrumb-item>
        <ch-breadcrumb-item href="https://bing.com" target="_blank">item 7</ch-breadcrumb-item>
        <ch-breadcrumb-item href="https://bing.com" target="_blank">item 8</ch-breadcrumb-item>
      </ch-overflow>`
    ),
};
