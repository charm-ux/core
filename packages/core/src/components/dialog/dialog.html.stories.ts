import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import '../button/index.js';
import './index.js';
import '../menu/index.js';
import '../select/index.js';
import type { CoreDialog } from './index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-dialog');

const meta: Meta<CoreDialog> = {
  title: 'Core/Dialog',
  component: 'ch-dialog',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

type Story = StoryObj<CoreDialog & typeof args>;

export const Default: Story = {
  render: args =>
    html`${template(
        args,
        html`<span slot="heading">dialog heading</span>
          dialog content
          <div slot="footer">
            <ch-button hides="dialog1">Cancel</ch-button>
            <ch-button hides="dialog1">Save</ch-button>
          </div>`
      )} <ch-button shows="dialog1">open dialog</ch-button>`,
  args: {
    id: 'dialog1',
  },
};

export const Position: Story = {
  render: args =>
    html`<div>
      ${template(
        args,
        html` <ch-button slot="actions"> <ch-icon name="warning"></ch-icon></ch-button>

          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel
            voluptates cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis.
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe
            nam. Eum aliquid aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem
            a. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident
            ad aut unde accusantium sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi
            laboriosam quis. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi
            earum dolor voluptas hic minima nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa
            explicabo consequatur
          </p>
          <div slot="footer">
            <ch-button hides="dialog">Cancel</ch-button>
            <ch-button hides="dialog">Save</ch-button>
          </div>`
      )}

      <div>
        <ch-button shows="dialog1">open drawer</ch-button>

        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore voluptatem similique reiciendis, ipsa
        accusamus distinctio dolorum quisquam, tenetur minima animi autem nobis. Molestias totam natus, deleniti nam
        itaque placeat quisquam!
      </div>
    </div>`,
  args: {
    id: 'dialog1',
    position: 'end',
    heading: 'Drawer heading',
  },
};

export const InitiallyOpen: Story = {
  render: args => html`
    ${template(
      args,
      html`<span slot="heading">dialog heading</span>
        dialog content
        <div slot="footer">
          <button hides="dialog">Cancel</button>
          <button hides="dialog">Save</button>
        </div>`
    )}

    <ch-button shows="dialog1">open dialog</ch-button>
  `,
  args: {
    id: 'dialog1',
    open: true,
  },
};

export const ChildWithTransition: Story = {
  render: args =>
    html`<div>
        ${template(args, html` <div class="child-with-transition">Content</div> `)}

        <ch-button shows="dialog1">open dialog</ch-button>
      </div>

      <style>
        .child-with-transition {
          opacity: 0;
          transition: opacity 0.5s;
        }

        [open] .child-with-transition {
          opacity: 1;
        }
      </style> `,
  args: {
    id: 'dialog1',
    heading: 'Testing transitionend event with slotted content with a transition',
  },
};

@customElement('my-element-dialog')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyElement extends LitElement {
  public render() {
    return html`
      <ch-dialog id="dialog1">
        <span slot="heading">dialog heading</span>
        <div class="child-with-transition">Content</div>
      </ch-dialog>

      <ch-button shows="dialog1">open dialog</ch-button>

      <style>
        .child-with-transition {
          opacity: 0;
          transition: opacity 0.5s;
        }

        [open] .child-with-transition {
          opacity: 1;
        }
      </style>
    `;
  }
}

export const InsideWebComponent: Story = {
  render: () => html`<my-element-dialog></my-element-dialog>`,
  args: {
    heading: 'Testing transitionend event inside a web component with slotted content with a transition',
  },
};

export const LongContent: Story = {
  render: args => html`
    ${template(
      args,
      html` <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel
          voluptates cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis.
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe
          nam. Eum aliquid aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a.
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad
          aut unde accusantium sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam
          quis. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor
          voluptas hic minima nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo
          consequatur
        </p>

        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel
          voluptates cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis.
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe
          nam. Eum aliquid aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a.
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad
          aut unde accusantium sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam
          quis. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor
          voluptas hic minima nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo
          consequatur
        </p>

        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel
          voluptates cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis.
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe
          nam. Eum aliquid aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a.
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad
          aut unde accusantium sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam
          quis. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor
          voluptas hic minima nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo
          consequatur
        </p>
        <div slot="footer">
          <ch-button hides="dialog1">Cancel</ch-button>
          <ch-button hides="dialog1">Save</ch-button>
        </div>`
    )}

    <ch-button id="openBtn">open dialog</ch-button>

    <script type="module">
      const component = document.querySelector('ch-dialog');
      const openBtn = document.getElementById('openBtn');
      openBtn.addEventListener('click', () => component.show());
    </script>
  `,
  args: {
    heading: 'Long dialog content',
  },
};

export const Autofocus: Story = {
  render: args =>
    html`<div>
      ${template(
        args,
        html` <input type="text" autofocus />
          <div slot="footer">
            <button id="closeBtn">Cancel</button>
            <button>Save</button>
          </div>`
      )}

      <ch-button shows="dialog1">open dialog</ch-button>
    </div>`,
  args: {
    id: 'dialog1',
    heading: 'Autofocus on first input',
  },
};

export const Animation: Story = {
  render: args =>
    html`${template(
        args,
        html`<span slot="heading">dialog heading</span>
          dialog content
          <div slot="footer">
            <ch-button hides="dialog1">Cancel</ch-button>
            <ch-button hides="dialog1">Save</ch-button>
          </div>`
      )}

      <ch-button shows="dialog1">open dialog</ch-button>`,
  args: {
    id: 'dialog1',
    '--dialog-transition': 'opacity 1s',
  },
};

export const HideCloseButton: Story = {
  render: args =>
    html`${template(
        args,
        html`<span slot="heading">dialog heading</span>
          dialog content
          <div slot="footer">
            <ch-button id="closeBtn">Cancel</ch-button>
            <ch-button>Save</ch-button>
          </div>`
      )}

      <ch-button shows="dialog1">open dialog</ch-button>`,
  args: {
    id: 'dialog1',
    'hide-close-button': true,
  },
};

export const NoHeader: Story = {
  render: args =>
    html`${template(
        args,
        html`<span slot="heading">dialog heading</span>
          dialog content
          <div slot="footer">
            <ch-button hides="dialog1">Cancel</ch-button>
            <ch-button hides="dialog1">Save</ch-button>
          </div>`
      )}

      <ch-button shows="dialog1">open dialog</ch-button>`,
  args: {
    'no-header': true,
  },
};

export const Alert: Story = {
  render: args =>
    html`${template(
        args,
        html`<span slot="heading">dialog heading</span>
          dialog content
          <div slot="footer"><ch-button hides="dialog1">Close</ch-button></div>`
      )}

      <ch-button shows="dialog1">open dialog</ch-button>`,
  args: {
    id: 'dialog1',
    alert: true,
  },
};

export const PageLock: Story = {
  render: args =>
    html`${template(
        args,
        html`<span slot="heading">dialog heading</span>
          dialog content
          <div slot="footer">
            <ch-button hides="dialog1">Cancel</ch-button>
            <ch-button hides="dialog1">Save</ch-button>
          </div>`
      )}

      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel voluptates
        cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis. Lorem ipsum,
        dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe nam. Eum aliquid
        aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a. Lorem ipsum, dolor
        sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad aut unde accusantium
        sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam quis. Lorem, ipsum
        dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor voluptas hic minima
        nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo consequatur
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel voluptates
        cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis. Lorem ipsum,
        dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe nam. Eum aliquid
        aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a. Lorem ipsum, dolor
        sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad aut unde accusantium
        sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam quis. Lorem, ipsum
        dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor voluptas hic minima
        nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo consequatur
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel voluptates
        cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis. Lorem ipsum,
        dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe nam. Eum aliquid
        aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a. Lorem ipsum, dolor
        sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad aut unde accusantium
        sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam quis. Lorem, ipsum
        dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor voluptas hic minima
        nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo consequatur
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel voluptates
        cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis. Lorem ipsum,
        dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe nam. Eum aliquid
        aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a. Lorem ipsum, dolor
        sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad aut unde accusantium
        sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam quis. Lorem, ipsum
        dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor voluptas hic minima
        nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo consequatur
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel voluptates
        cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis. Lorem ipsum,
        dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe nam. Eum aliquid
        aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a. Lorem ipsum, dolor
        sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad aut unde accusantium
        sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam quis. Lorem, ipsum
        dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor voluptas hic minima
        nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo consequatur
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel voluptates
        cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis. Lorem ipsum,
        dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe nam. Eum aliquid
        aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a. Lorem ipsum, dolor
        sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad aut unde accusantium
        sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam quis. Lorem, ipsum
        dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor voluptas hic minima
        nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo consequatur
      </p>
      <ch-button shows="dialog1">open dialog</ch-button>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloribus nam aut amet similique, iure vel voluptates
        cum cumque repellendus perferendis maiores officia unde in? Autem neque sequi maiores eum omnis. Lorem ipsum,
        dolor sit amet consectetur adipisicing elit. Perspiciatis ipsam explicabo tempora ipsum saepe nam. Eum aliquid
        aperiam, laborum labore excepturi nisi odio deserunt facilis error. Mollitia dolor quidem a. Lorem ipsum, dolor
        sit amet consectetur adipisicing elit. Eius soluta ea repellendus voluptatum provident ad aut unde accusantium
        sed. Officia qui praesentium repudiandae maxime molestias, non mollitia animi laboriosam quis. Lorem, ipsum
        dolor sit amet consectetur adipisicing elit. Inventore, architecto eligendi earum dolor voluptas hic minima
        nihil porro odio suscipit quaerat accusantium, aperiam, neque beatae ipsa explicabo consequatur
      </p>`,
  args: {
    id: 'dialog1',
  },
};
