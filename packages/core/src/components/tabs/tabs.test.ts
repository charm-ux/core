import { html } from '@open-wc/testing';
import { CoreDisabledTabsTests, CoreTabsTests } from './tabs.test-harness.js';
import '../tab/index.js';
import '../tab-panel/index.js';
import './index.js';

new CoreTabsTests().runTests(
  config =>
    html` <ch-tabs ${config}>
      <ch-tab id="tab-1">one</ch-tab>
      <ch-tab id="tab-2">two</ch-tab>
      <ch-tab id="tab-3">three <span>child</span></ch-tab>
      <ch-tab id="tab-4">four</ch-tab>
      <ch-tab id="tab-5">five</ch-tab>
      <ch-tab id="tab-6">six</ch-tab>
      <ch-tab-panel id="panel-1">panel one</ch-tab-panel>
      <ch-tab-panel id="panel-2">panel two</ch-tab-panel>
      <ch-tab-panel id="panel-3">panel three</ch-tab-panel>
      <ch-tab-panel id="panel-4">panel four</ch-tab-panel>
      <ch-tab-panel id="panel-5">panel five</ch-tab-panel>
      <ch-tab-panel id="panel-6">panel six</ch-tab-panel>
    </ch-tabs>`
);

// disabled specific tests that need the disabled attribute applied before the first render
new CoreDisabledTabsTests().runTests(
  config =>
    html` <ch-tabs ${config}>
      <ch-tab id="tab-1" disabled>one</ch-tab>
      <ch-tab id="tab-2">two</ch-tab>
      <ch-tab id="tab-3">three <span>child</span></ch-tab>
      <ch-tab id="tab-4">four</ch-tab>
      <ch-tab id="tab-5">five</ch-tab>
      <ch-tab id="tab-6">six</ch-tab>
      <ch-tab-panel id="panel-1">panel one</ch-tab-panel>
      <ch-tab-panel id="panel-2">panel two</ch-tab-panel>
      <ch-tab-panel id="panel-3">panel three</ch-tab-panel>
      <ch-tab-panel id="panel-4">panel four</ch-tab-panel>
      <ch-tab-panel id="panel-5">panel five</ch-tab-panel>
      <ch-tab-panel id="panel-6">panel six</ch-tab-panel>
    </ch-tabs>`
);
