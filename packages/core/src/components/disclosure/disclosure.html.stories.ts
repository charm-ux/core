import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import '../button/index.js';
import '../icon/index.js';
import './index.js';
import type { CoreDisclosure } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-disclosure');

const meta: Meta<CoreDisclosure> = {
  title: 'Core/Disclosure',
  component: 'ch-disclosure',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreDisclosure & typeof args>;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <h3 slot="trigger"><button>Heading</button></h3>
        Content expand region
      `
    ),
};

export const ExpandDownwards: Story = {
  render: args =>
    template(
      args,
      html`
        <h3 slot="trigger"><button>Heading</button></h3>
        Content expand region
      `
    ),
  args: {
    'content-below': true,
  },
};

export const WithPreview: Story = {
  render: () => html`
    <style>
      :root {
        --disclosure-closed-max-height: 4rem;
        --disclosure-gap: 8px;
      }
      .disclosure-button::part(button-control),
      .disclosure-button::part(button-control):hover,
      .disclosure-button::part(button-control):focus {
        color: var(--body-fg-color);
        background-color: transparent;
        border: none;
        box-shadow: none;
      }
      ch-disclosure[open] .chevron {
        transform: rotate(-180deg);
      }
    </style>
    <div style="max-width: 600px;">
      <ch-disclosure
        @disclosure-show=${() => {
          const buttonText = document.querySelector('.button-text');
          if (buttonText) buttonText.textContent = 'Show Less';
        }}
        @disclosure-hide=${() => {
          const buttonText = document.querySelector('.button-text');
          if (buttonText) buttonText.textContent = 'Show More';
        }}
      >
        <h3 slot="trigger">
          <ch-button class="disclosure-button"
            ><ch-icon slot="start" class="chevron" name="chevron-down"></ch-icon
            ><span class="button-text">Show More</span></ch-button
          >
        </h3>
        This is a disclosure with --disclosure-closed-max-height set to a non-zero value. When closed, only a few lines
        of this text will be shown due to the max-height constraint. When open, all of the content will become visible.
        You can use this to create collapsible previews for long sections of content without hiding them entirely. Lorem
        ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
        aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat.
      </ch-disclosure>
    </div>
  `,
  args: {},
};

export const WithPreviewAndAnimation: Story = {
  render: () => html`
    <style>
      :root {
        --disclosure-closed-max-height: 4rem;
        --disclosure-opened-max-height: 16rem;
        --disclosure-gap: 8px;
        --disclosure-show-transition: max-height 0.5s ease-in-out;
        --disclosure-hide-transition: max-height 0.5s ease-in-out;
      }
      .disclosure-button::part(button-control),
      .disclosure-button::part(button-control):hover,
      .disclosure-button::part(button-control):focus {
        color: var(--body-fg-color);
        background-color: transparent;
        border: none;
        box-shadow: none;
      }
      ch-disclosure[open] .chevron {
        transform: rotate(-180deg);
      }
    </style>
    <div style="max-width: 600px;">
      <ch-disclosure
        @disclosure-show=${() => {
          const buttonText = document.querySelector('.button-text');
          if (buttonText) buttonText.textContent = 'Show Less';
        }}
        @disclosure-hide=${() => {
          const buttonText = document.querySelector('.button-text');
          if (buttonText) buttonText.textContent = 'Show More';
        }}
      >
        <h3 slot="trigger">
          <ch-button class="disclosure-button"
            ><ch-icon slot="start" class="chevron" name="chevron-down"></ch-icon
            ><span class="button-text">Show More</span></ch-button
          >
        </h3>
        This is a disclosure with --disclosure-closed-max-height set to a non-zero value. When closed, only a few lines
        of this text will be shown due to the max-height constraint. When open, all of the content will become visible.
        You can use this to create collapsible previews for long sections of content without hiding them entirely. Lorem
        ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
        aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat.
      </ch-disclosure>
    </div>
  `,
  args: {},
};
