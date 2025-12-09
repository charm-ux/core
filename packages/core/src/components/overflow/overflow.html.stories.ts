import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import '../button/button.js';
import '../icon/icon.js';
import type { CoreOverflow } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-overflow');

const meta: Meta<CoreOverflow> = {
  title: 'Core/Overflow',
  component: 'ch-overflow',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreOverflow & typeof args>;

export const Default: Story = {
  render: args => template(args),
  args: {
    'default-slot': `<button>one</button><button>two</button><button>three</button><button>four</button><button>five</button><button>six</button><button>seven</button><button>eight</button><button>nine</button><button>ten</button><button>eleven</button><button>twelve</button><button>thirteen</button><button>fourteen</button><button>fifteen</button><button>sixteen</button><button>seventeen</button><button>eighteen</button><button>nineteen</button><button>twenty</button><button>twenty-one</button><button>twenty-two</button><button>twenty-three</button><button>twenty-four</button><button>twenty-five</button>`,
  },
};

export const Min: Story = {
  render: args => template(args),
  args: {
    'default-slot': `<button>one</button><button>two</button><button>three</button><button>four</button><button>five</button><button>six</button><button>seven</button><button>eight</button><button>nine</button>`,
    min: 6,
  },
};

export const OverflowDirectionStart: Story = {
  render: args => template(args),
  args: {
    'default-slot': `<button>one</button><button>two</button><button>three</button><button>four</button><button>five</button><button>six</button><button>seven</button><button>eight</button><button>nine</button>`,
    'overflow-direction': 'start',
  },
};

export const CustomMenu: Story = {
  render: args => html`
    ${template(args)}
    <script>
      function setupOverflow() {
        const buttonData = [
          {
            label: 'Settings',
            id: '1',
          },
          {
            label: 'Profile',
            id: '2',
          },
          {
            label: 'About',
            id: '3',
          },
          {
            label: 'Help',
            id: '4',
          },
          {
            label: 'Tasks',
            id: '5',
          },
          {
            label: 'Marketplace',
            id: '6',
          },
          {
            label: 'Search',
            id: '7',
          },
          {
            label: 'Theme',
            id: '8',
          },
        ];
        const chOverflow = document.querySelector('ch-overflow');

        buttonData.forEach(item => {
          const button = document.createElement('button');
          button.style.width = '100px';
          button.setAttribute('data-id', item.id);
          button.setAttribute('slot', '');
          button.innerText = item.label;
          chOverflow.appendChild(button);
        });

        const handleOverflow = event => {
          const overflowingItems = event.detail.overflowedElements;
          const overflowMenu = document.getElementById('menu');
          overflowMenu.innerHTML = '';
          overflowingItems.forEach(item => {
            const menuItem = document.createElement('ch-menu-item');
            menuItem.innerText = item.innerText;
            overflowMenu.appendChild(menuItem);
          });
        };

        chOverflow.addEventListener('overflow', handleOverflow);
      }
      setupOverflow();
    </script>
  `,
  args: {
    'end-slot': `<ch-dropdown><button slot="trigger">...</button><ch-menu id="menu"></ch-menu></ch-dropdown>`,
  },
};

export const WithIconButtons: Story = {
  render: args =>
    template(
      args,
      html`
        <ch-button>
          <ch-icon name="circle" slot="start"></ch-icon>
          Settings
        </ch-button>
        <ch-button>
          <ch-icon name="person" slot="start"></ch-icon>
          Profile
        </ch-button>
        <ch-button>
          <ch-icon name="checkmark" slot="start"></ch-icon>
          About
        </ch-button>
        <ch-button>
          <ch-icon name="question" slot="start"></ch-icon>
          Help
        </ch-button>
        <ch-button>
          <ch-icon name="warning-shield" slot="start"></ch-icon>
          Tasks
        </ch-button>
        <ch-button>
          <ch-icon name="checkmark-circle" slot="start"></ch-icon>
          Marketplace
        </ch-button>
        <ch-button>
          <ch-icon name="error-circle" slot="start"></ch-icon>
          Theme
        </ch-button>
      `
    ),
};

export const StartEndSlot: Story = {
  render: args => template(args),
  args: {
    'default-slot': `<button>one</button><button>two</button><button>three</button><button>four</button><button>five</button><button>six</button><button>seven</button><button>eight</button><button>nine</button>`,
    'overflow-direction': 'start',
    'start-slot': `<ch-icon name="person" slot="start"></ch-icon>`,
    'end-slot': `<ch-icon name="warning-shield" slot="start"></ch-icon>`,
  },
};
