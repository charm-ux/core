import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CoreSkeleton } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-skeleton');

const meta: Meta<CoreSkeleton> = {
  title: 'Core/Skeleton',
  component: 'ch-skeleton',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreSkeleton & typeof args>;

export const Animation: Story = {
  render: args => template(args),
  args: {
    animation: 'pulse',
  },
};

export const Shape: Story = {
  render: args =>
    html`${template(args)}
      <style>
        ch-skeleton {
          width: 45px;
          height: 45px;
        }
      </style> `,
  args: {
    shape: 'circle',
  },
};

const AnimationTemplate = () => html`
  <p>Wave Animation</p>
  <div style="box-sizing: border-box;">
    <ch-skeleton
      style="--skeleton-width: 50px; --skeleton-min-height: 50px;"
      shape="circle"
      animation="wave"
    ></ch-skeleton>
    <ch-skeleton class="small-skeleton" shape="rect" animation="wave"></ch-skeleton>
    <ch-skeleton class="small-skeleton" shape="rect" animation="wave"></ch-skeleton>
    <ch-skeleton class="small-skeleton" shape="rect" animation="wave"></ch-skeleton>
    <ch-skeleton
      style="
      --skeleton-border-radius: 4px;
      --skeleton-width: 75px;
      --skeleton-min-height: 30px;
      margin-top: 20px;
      margin-bottom: 10px;
    "
      shape="rect"
      animation="wave"
    ></ch-skeleton>
    <style>
      ch-skeleton.small-skeleton {
        --skeleton-border-radius: 4px;
        --skeleton-min-height: 10px;
        margin-top: 10px;
      }
    </style>
  </div>

  <p>Pulse Animation</p>

  <div style="box-sizing: border-box;">
    <ch-skeleton
      style="--skeleton-width: 50px; --skeleton-min-height: 50px;"
      shape="circle"
      animation="pulse"
    ></ch-skeleton>
    <ch-skeleton class="small-skeleton" shape="rect" animation="pulse"></ch-skeleton>
    <ch-skeleton class="small-skeleton" shape="rect" animation="pulse"></ch-skeleton>
    <ch-skeleton class="small-skeleton" shape="rect" animation="pulse"></ch-skeleton>
    <ch-skeleton
      style="
      --skeleton-border-radius: 4px;
      --skeleton-width: 75px;
      --skeleton-min-height: 30px;
      margin-top: 20px;
      margin-bottom: 10px;
    "
      shape="rect"
      animation="pulse"
    ></ch-skeleton>
    <style>
      ch-skeleton.small-skeleton {
        --skeleton-border-radius: 4px;
        --skeleton-min-height: 10px;
        margin-top: 10px;
      }
    </style>
  </div>
`;

export const AnimationGroup: StoryObj = AnimationTemplate.bind({});
