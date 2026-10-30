import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components-vite';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

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
      .disclosure-preview {
        --charm-disclosure-closed-max-height: 4rem;
        --charm-disclosure-gap: 8px;
      }
      .disclosure-button,
      .disclosure-button:hover {
        color: var(--body-fg-color);
        background-color: transparent;
        border: none;
        box-shadow: none;
      }
      .disclosure-button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
      ch-disclosure[open] .chevron {
        transform: rotate(-180deg);
      }
    </style>
    <div class="disclosure-preview" style="max-width: 600px;">
      <ch-disclosure
        @disclosure-show=${(event: Event) => {
          const buttonText = (event.currentTarget as HTMLElement).querySelector('.button-text');
          if (buttonText) buttonText.textContent = 'Show Less';
        }}
        @disclosure-hide=${(event: Event) => {
          const buttonText = (event.currentTarget as HTMLElement).querySelector('.button-text');
          if (buttonText) buttonText.textContent = 'Show More';
        }}
      >
        <button slot="trigger" class="disclosure-button">
          <ch-icon class="chevron" name="chevron-down"></ch-icon>
          <span class="button-text">Show More</span>
        </button>
        This is a disclosure with --charm-disclosure-closed-max-height set to a non-zero value. When closed, only a few
        lines of this text will be shown due to the max-height constraint. When open, all of the content will become
        visible. You can use this to create collapsible previews for long sections of content without hiding them
        entirely. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </ch-disclosure>
    </div>
  `,
  args: {},
};

export const WithPreviewAndAnimation: Story = {
  render: () => html`
    <style>
      .disclosure-preview {
        --charm-disclosure-closed-max-height: 4rem;
        --charm-disclosure-opened-max-height: 16rem;
        --charm-disclosure-gap: 8px;
        --charm-disclosure-show-transition: max-height 0.5s ease-in-out;
        --charm-disclosure-hide-transition: max-height 0.5s ease-in-out;
      }
      .disclosure-button,
      .disclosure-button:hover {
        color: var(--body-fg-color);
        background-color: transparent;
        border: none;
        box-shadow: none;
      }
      .disclosure-button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
      ch-disclosure[open] .chevron {
        transform: rotate(-180deg);
      }
    </style>
    <div class="disclosure-preview" style="max-width: 600px;">
      <ch-disclosure
        @disclosure-show=${(event: Event) => {
          const buttonText = (event.currentTarget as HTMLElement).querySelector('.button-text');
          if (buttonText) buttonText.textContent = 'Show Less';
        }}
        @disclosure-hide=${(event: Event) => {
          const buttonText = (event.currentTarget as HTMLElement).querySelector('.button-text');
          if (buttonText) buttonText.textContent = 'Show More';
        }}
      >
        <button slot="trigger" class="disclosure-button">
          <ch-icon class="chevron" name="chevron-down"></ch-icon>
          <span class="button-text">Show More</span>
        </button>
        This is a disclosure with --charm-disclosure-closed-max-height set to a non-zero value. When closed, only a few
        lines of this text will be shown due to the max-height constraint. When open, all of the content will become
        visible. You can use this to create collapsible previews for long sections of content without hiding them
        entirely. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </ch-disclosure>
    </div>
  `,
  args: {},
};
