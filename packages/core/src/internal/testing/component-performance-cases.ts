import type { ComponentPerformanceCase } from './component-performance.js';

const requestUpdate = (element: HTMLElement) =>
  (element as HTMLElement & { requestUpdate: () => void }).requestUpdate();

export const composedComponentCases = {
  menu: {
    name: 'menu-with-items',
    create: () => {
      const element = document.createElement('ch-menu');
      element.innerHTML = Array.from({ length: 5 }, (_, index) => `<ch-menu-item>Item ${index}</ch-menu-item>`).join(
        ''
      );
      return element;
    },
    update: requestUpdate,
  },
  menuItem: {
    name: 'menu-item-with-submenu',
    create: () => {
      const element = document.createElement('ch-menu-item');
      element.innerHTML = '<ch-menu-item>Child one</ch-menu-item><ch-menu-item>Child two</ch-menu-item>';
      return element;
    },
    update: requestUpdate,
  },
  menuGroup: {
    name: 'menu-group-with-items',
    create: () => {
      const element = document.createElement('ch-menu-group');
      element.innerHTML = Array.from({ length: 5 }, (_, index) => `<ch-menu-item>Item ${index}</ch-menu-item>`).join(
        ''
      );
      return element;
    },
    update: requestUpdate,
  },
  buttonGroup: {
    name: 'button-group-with-buttons',
    create: () => {
      const element = document.createElement('ch-button-group');
      element.innerHTML = Array.from({ length: 5 }, (_, index) => `<ch-button>Button ${index}</ch-button>`).join('');
      return element;
    },
    update: requestUpdate,
  },
  accordion: {
    name: 'accordion-with-items',
    create: () => {
      const element = document.createElement('ch-accordion');
      element.innerHTML = Array.from(
        { length: 5 },
        (_, index) => `<ch-accordion-item>Panel ${index}</ch-accordion-item>`
      ).join('');
      return element;
    },
    update: requestUpdate,
  },
  breadcrumb: {
    name: 'breadcrumb-with-items',
    create: () => {
      const element = document.createElement('ch-breadcrumb');
      element.innerHTML = Array.from(
        { length: 5 },
        (_, index) => `<ch-breadcrumb-item>Level ${index}</ch-breadcrumb-item>`
      ).join('');
      return element;
    },
    update: requestUpdate,
  },
  select: {
    name: 'select-with-options',
    create: () => {
      const element = document.createElement('ch-select');
      element.innerHTML = Array.from(
        { length: 20 },
        (_, index) => `<option value="${index}">Option ${index}</option>`
      ).join('');
      return element;
    },
    update: requestUpdate,
  },
  dialog: {
    name: 'dialog-with-content',
    create: () => {
      const element = document.createElement('ch-dialog');
      element.innerHTML =
        '<span slot="heading">Heading</span><p>Body content</p>' +
        '<button slot="footer">Cancel</button><button slot="footer">Confirm</button>';
      return element;
    },
    update: requestUpdate,
  },
} satisfies Record<string, ComponentPerformanceCase>;

export const composedPerformanceOptions = { iterations: 10, warmups: 2, bulkCounts: [10, 50] };
