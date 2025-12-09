import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CorePopup } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-popup');

const meta: Meta<CorePopup> = {
  title: 'Core/Popup',
  component: 'ch-popup',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
    controls: {
      sort: 'alpha',
    },
  },
};

export default meta;

type Story = StoryObj<CorePopup & typeof args>;

export const Default: Story = {
  render: args => html`
    ${template(
      args,
      html`
        <span slot="anchor" id="anchor"></span>
        <div class="box"></div>
      `
    )}

    <script>
      const component = document.querySelector('ch-popup');
      component.querySelector('#anchor')?.addEventListener('mouseover', () => {
        component.open = true;
      });
      component.querySelector('#anchor')?.addEventListener('mouseout', () => {
        component.open = false;
      });
    </script>

    <style>
      span[slot='anchor'] {
        display: inline-block;
        width: 150px;
        height: 150px;
        border: dashed 2px black;
        margin: 50px;
        background: black;
      }

      .box {
        width: 100px;
        height: 50px;
        background: blue;
      }
    </style>
  `,
  args: {
    open: false,
    arrow: true,
    '--popup-arrow-color': 'blue',
  },
};

export const Animation: Story = {
  render: args => html`
    ${template(
      args,
      html`
        <span slot="anchor" id="anchor"></span>
        <div class="box"></div>
      `
    )}

    <script>
      const component = document.querySelector('[popup]');
      component.querySelector('#anchor')?.addEventListener('mouseover', () => {
        component.open = true;
      });
      component.querySelector('#anchor')?.addEventListener('mouseout', () => {
        component.open = false;
      });
    </script>

    <style>
      span[slot='anchor'] {
        display: inline-block;
        width: 150px;
        height: 150px;
        border: dashed 2px black;
        margin: 50px;
        background: black;
      }

      .box {
        width: 100px;
        height: 50px;
        background: blue;
      }
    </style>
  `,
  args: {
    open: false,
    '--popup-show-transition': 'opacity 1s',
    '--popup-hide-transition': 'opacity 1s',
    '--popup-arrow-color': 'blue',
  },
};

export const HoverBridge: Story = {
  render: args => html`
    ${template(
      args,
      html`
        <span slot="anchor" id="anchor"></span>
        <div class="box"></div>
      `
    )}

    <script>
      const component = document.querySelector('ch-popup');
      component.querySelector('#anchor')?.addEventListener('mouseover', () => {
        component.open = true;
      });
      component.querySelector('#anchor')?.addEventListener('mouseout', () => {
        component.open = false;
      });
    </script>

    <style>
      span[slot='anchor'] {
        display: inline-block;
        width: 150px;
        height: 150px;
        border: dashed 2px black;
        margin: 50px;
        background: black;
      }

      .box {
        width: 100px;
        height: 50px;
        background: blue;
      }

      [popup]::part(popup-hover-bridge) {
        background: tomato;
        opacity: 0.5;
      }
    </style>
  `,
  args: {
    'hover-bridge': true,
    distance: 20,
    skidding: 10,
  },
};
