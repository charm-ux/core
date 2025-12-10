import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import './index.js';
import type { CorePushPane } from './index.js';
import '../button/index.js';
import '../icon/index.js';

const { args, argTypes, events, template } = getStorybookHelpers('ch-push-pane');

const meta: Meta<CorePushPane> = {
  title: 'Core/Push Pane',
  component: 'ch-push-pane',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;

const sampleContentTemplate = html`
  <article>
    <p>
      Integer nec nulla vitae lacus ultricies euismod. Integer libero nulla, ultricies ut rhoncus vestibulum, pulvinar
      vitae metus. Ut rhoncus felis id condimentum pretium. Curabitur ipsum mi, venenatis a quam ut, auctor dapibus sem.
      Proin magna sem, malesuada at lacinia eget, ornare ac erat. Pellentesque nec arcu feugiat, luctus justo sit amet,
      bibendum sem. Ut pellentesque malesuada molestie.
    </p>
    <p>
      Fusce euismod massa at nisi congue, id tempor libero congue. Sed congue elit ac magna efficitur, at placerat
      libero suscipit. Nunc ullamcorper sed ligula sed rutrum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Mauris ultricies tempor orci sit amet molestie. In venenatis vitae nibh sed ultricies. Curabitur porttitor justo
      lectus, et hendrerit tortor egestas quis. Suspendisse vel ante ut nisi porta maximus consectetur vitae urna.
      Suspendisse id nunc scelerisque, porta nunc ut, pulvinar lorem. Curabitur ac nibh ut ex pellentesque lacinia ut et
      erat. Proin ultricies, justo id vehicula rhoncus, nibh tortor fermentum mauris, vel hendrerit diam mi pulvinar
      sem. Sed vitae arcu suscipit, cursus diam cursus, fringilla enim. Integer luctus pellentesque leo non rutrum.
      Nulla a tortor tincidunt libero tincidunt pulvinar. Integer vitae semper neque. Morbi sit amet orci ante.
    </p>
    <p>
      Sed congue mauris vel dui viverra maximus. Praesent quis aliquam velit, at scelerisque metus. Nam fringilla
      placerat velit quis egestas. In magna ligula, dictum id lorem eu, auctor faucibus risus. Praesent lacinia
      tincidunt maximus. Etiam libero tellus, fermentum eget ligula id, vestibulum pharetra nunc. Curabitur imperdiet
      nisi non leo iaculis, eu consequat lacus ornare. Praesent consequat laoreet turpis a tincidunt. Sed quam neque,
      scelerisque quis elit a, egestas suscipit enim.
    </p>
  </article>
`;

type Story = StoryObj<CorePushPane & typeof args>;

export const Default: Story = {
  render: args => html`
    <div class="push-pane-overview">
      ${template(args, html`<p>Push pane content</p>`)}
      <div>
        <ch-button toggles="push-pane">toggle pane</ch-button>
        ${sampleContentTemplate}
      </div>
    </div>
    <style>
      .push-pane-overview {
        display: grid;
        grid-template-columns: minmax(0, auto) 1fr;
      }
    </style>
  `,
  args: {
    id: 'push-pane',
    heading: 'Push pane heading',
  },
};

export const PlacementAtEnd: Story = {
  render: args =>
    html` <div class="push-pane-overview">
        <div>
          <ch-button toggles="push-pane">toggle pane</ch-button>
          ${sampleContentTemplate}
        </div>
        ${template(args, html`<p>Push pane content</p>`)}
      </div>
      <style>
        .push-pane-overview {
          display: grid;
          grid-template-columns: 1fr minmax(0, auto);
        }
      </style>`,
  args: {
    id: 'push-pane',
    heading: 'Push pane heading',
    position: 'end',
  },
};

export const PlacementAtBottom: Story = {
  render: args =>
    html` <div class="push-pane-overview">
        <div class="text">
          <ch-button toggles="push-pane">toggle pane</ch-button>
          ${sampleContentTemplate}
        </div>
        ${template(args, html`<p>Push pane content</p>`)}
      </div>
      <style>
        .push-pane-overview {
          display: flex;
          flex-direction: column;
          height: 500px;
        }

        .text {
          flex: 1;
          overflow: auto;
        }
      </style>`,
  args: {
    id: 'push-pane',
    heading: 'Push pane heading',
    position: 'bottom',
  },
};
export const Actions: Story = {
  render: args =>
    html` <div class="push-pane-overview">
        ${template(
          args,
          html`<p>Push pane content</p>
            <ch-button slot="actions" hides="push-pane">
              <ch-icon class="action-icon" name="warning"></ch-icon
            ></ch-button>
            <ch-button slot="footer" hides="push-pane">Close</ch-button>
            <ch-button slot="footer" hides="push-pane">Do something</ch-button> `
        )}
        <div>
          <ch-button toggles="push-pane">toggle pane</ch-button>
          ${sampleContentTemplate}
        </div>
      </div>
      <style>
        .push-pane-overview {
          display: grid;
          grid-template-columns: minmax(0, auto) 1fr;
        }
      </style>`,
  args: {
    id: 'push-pane',
    heading: 'Push pane heading',
    position: 'end',
  },
};

export const Scroll: Story = {
  render: args => html`
    <div class="push-pane-overview">
      ${template(
        args,
        html`<p>Push pane content</p>
          ${sampleContentTemplate}
          <ch-button slot="actions" hides="push-pane">
            <ch-icon class="action-icon" name="warning"></ch-icon
          ></ch-button>
          <ch-button slot="footer" hides="push-pane">Close</ch-button>
          <ch-button slot="footer" hides="push-pane">Do something</ch-button> `
      )}
      <div>
        <ch-button toggles="push-pane">toggle pane</ch-button>
      </div>
    </div>
    <style>
      .push-pane-overview {
        display: grid;
        grid-template-columns: minmax(0, auto) 1fr;
      }

      [push-pane] {
        max-height: 400px;
      }
    </style>
  `,
  args: {
    id: 'push-pane',
    heading: 'Push pane heading',
    position: 'end',
  },
};

export const Animation: Story = {
  render: args => html`
    <div class="push-pane-overview">
      ${template(args, html`<p>Push pane content</p>`)}
      <div>
        <ch-button toggles="push-pane">toggle pane</ch-button>
        ${sampleContentTemplate}
      </div>
    </div>
    <style>
      .push-pane-overview {
        display: grid;
        grid-template-columns: minmax(0, auto) 1fr;
      }

      ch-push-pane {
        --push-pane-transition: opacity 0.3s, width 400ms;
      }
    </style>
  `,
  args: {
    id: 'push-pane',
    heading: 'Push pane heading',
  },
};

export const Separator: Story = {
  render: args =>
    html` <div class="push-pane-overview">
        ${template(args, html`<p>Push pane content</p>`)}
        <div>
          <ch-button toggles="push-pane">toggle pane</ch-button>
          ${sampleContentTemplate}
        </div>
      </div>
      <style>
        .push-pane-overview {
          display: grid;
          grid-template-columns: minmax(0, auto) 1fr;
        }

        ch-push-pane {
          --push-pane-divider-color: black;
        }
      </style>`,
  args: {
    id: 'push-pane',
    heading: 'Push pane heading',
  },
};

export const HideCloseButton: Story = {
  render: args => html`
    <div class="push-pane-overview">
      ${template(args, html`Push pane content`)}
      <div>
        <ch-button toggles="push-pane">toggle pane</ch-button>
        ${sampleContentTemplate}
      </div>
    </div>
    <style>
      .push-pane-overview {
        display: grid;
        grid-template-columns: minmax(0, auto) 1fr;
      }
    </style>
  `,
  args: {
    id: 'push-pane',
    heading: 'Push pane heading',
    'hide-close-button': true,
  },
};

export const NoHeader: Story = {
  render: args => html`
    <div class="push-pane-overview">
      ${template(args, html`Push pane content`)}
      <div>
        <ch-button toggles="push-pane">toggle pane</ch-button>
        ${sampleContentTemplate}
      </div>
    </div>
    <style>
      .push-pane-overview {
        display: grid;
        grid-template-columns: minmax(0, auto) 1fr;
      }
    </style>
  `,
  args: {
    id: 'push-pane',
    heading: 'Push pane heading',
    'no-header': true,
  },
};
