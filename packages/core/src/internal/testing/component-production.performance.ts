import {
  benchmarkComponentPerformance,
  benchmarkTagPerformance,
} from '../../../dist/internal/testing/component-performance.js';
import { composedComponentCases, composedPerformanceOptions } from './component-performance-cases.js';
import '../../../dist/components/accordion/index.js';
import '../../../dist/components/accordion-item/index.js';
import '../../../dist/components/alert/index.js';
import '../../../dist/components/avatar/index.js';
import '../../../dist/components/badge/index.js';
import '../../../dist/components/breadcrumb/index.js';
import '../../../dist/components/breadcrumb-item/index.js';
import '../../../dist/components/button/index.js';
import '../../../dist/components/button-group/index.js';
import '../../../dist/components/button-group-overflow/index.js';
import '../../../dist/components/card/index.js';
import '../../../dist/components/checkbox/index.js';
import '../../../dist/components/dialog/index.js';
import '../../../dist/components/disclosure/index.js';
import '../../../dist/components/divider/index.js';
import '../../../dist/components/icon/index.js';
import '../../../dist/components/input/index.js';
import '../../../dist/components/menu/index.js';
import '../../../dist/components/menu-group/index.js';
import '../../../dist/components/menu-item/index.js';
import '../../../dist/components/overflow/index.js';
import '../../../dist/components/popup/index.js';
import '../../../dist/components/progress-bar/index.js';
import '../../../dist/components/push-pane/index.js';
import '../../../dist/components/radio/index.js';
import '../../../dist/components/radio-group/index.js';
import '../../../dist/components/scoped-styles/index.js';
import '../../../dist/components/select/index.js';
import '../../../dist/components/skeleton/index.js';
import '../../../dist/components/spinner/index.js';
import '../../../dist/components/switch/index.js';
import '../../../dist/components/tab/index.js';
import '../../../dist/components/tab-panel/index.js';
import '../../../dist/components/tabs/index.js';
import '../../../dist/components/text-area/index.js';
import '../../../dist/components/tooltip/index.js';

const components = [
  'accordion',
  'accordion-item',
  'alert',
  'avatar',
  'badge',
  'breadcrumb',
  'breadcrumb-item',
  'button',
  'button-group',
  'button-group-overflow',
  'card',
  'checkbox',
  'dialog',
  'disclosure',
  'divider',
  'icon',
  'input',
  'menu',
  'menu-group',
  'menu-item',
  'overflow',
  'popup',
  'progress-bar',
  'push-pane',
  'radio',
  'radio-group',
  'scoped-styles',
  'select',
  'skeleton',
  'spinner',
  'switch',
  'tab',
  'tab-panel',
  'tabs',
  'text-area',
  'tooltip',
];

describe('production component performance benchmarks', () => {
  for (const name of components) {
    it(`${name} reports mount, rerender, and bulk mount timings`, () => benchmarkTagPerformance(name, `ch-${name}`));
  }

  for (const component of Object.values(composedComponentCases)) {
    it(`${component.name} reports composed production timings`, () =>
      benchmarkComponentPerformance(component, composedPerformanceOptions));
  }
});
