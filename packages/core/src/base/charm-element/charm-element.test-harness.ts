import { aTimeout, elementUpdated, expect, fixture } from '@open-wc/testing';
import { TemplateResult } from 'lit';
import sinon from 'sinon';
import { spread } from '@open-wc/lit-helpers';
import { project } from '../../utilities/index.js';
import { findUnsafeDirectionalCSS } from '../../internal/testing/styles.js';
import CharmElement from './charm-element.js';

type BaseTest = {
  /** Description for test or group of tests */
  description: string;

  /** Skip test or group of tests */
  skip?: boolean;

  /** Only run this test or group of tests */
  only?: boolean;
};

/** Test for an individual component */
export type ComponentTest = BaseTest & {
  /** Logic for test */
  test: () => Promise<void> | (() => void);
  /** Test-specific component configuration */
  config?: {
    [key: string]: unknown;
  };
};

/** Group of tests for a component */
export type TestGroup = BaseTest & {
  /** Group of tests */
  tests: TestConfig;

  /** Runs once before the first test in this block */
  before?: () => Promise<void> | (() => void);

  /** Runs once after the last test in this block */
  after?: () => Promise<void> | (() => void);

  /** Runs before each test in this block */
  beforeEach?: () => Promise<void> | (() => void);

  /** Runs after each test in this block */
  afterEach?: () => Promise<void> | (() => void);
};

/** Test configuration for a component */
export type TestConfig = {
  [key: string]: ComponentTest | TestGroup;
};

export class CharmElementTests<T extends CharmElement> {
  /** Global component reference to be used in each test. Default to a `div` to reduce optional chaining */
  protected component: T = document.createElement('div') as unknown as T;

  /** Initial component setup when components are executed. This will be used to reset the component for each test. */
  protected defaultComponent?: (config?: any) => TemplateResult;

  /** Global test object that can be extended and overridden for each component */
  protected tests: TestConfig = {
    base: {
      description: `"${this.component.tagName.toLowerCase()}" base`,
      tests: {
        accessibility: {
          description: 'should be accessible',
          test: async () => {
            // wait for initial animations to complete
            await aTimeout(500);
            await expect(this.component).to.be.accessible({
              ignoredRules: ['aria-allowed-role'],
            });
          },
        },

        // attribute and property tests
        properties: {
          description: 'properties',
          tests: {
            componentAttribute: {
              description: 'should have an attribute that matches the component name',
              test: async () => {
                const attr = this.component.hasAttribute(project.scope.getBaseName(this.component));
                expect(attr).to.not.be.undefined;
              },
            },
          },
        },

        // method tests
        methods: {
          description: 'methods',
          tests: {},
        },

        // slot tests
        slots: {
          description: 'slots',
          tests: {},
        },

        // event tests
        events: {
          description: 'events',
          tests: {
            readyEvent: {
              description: 'should fire a custom event when the component is ready',
              test: async () => {
                const el = this.createCharmElement(this.component);
                const readyHandler = sinon.spy();

                el.addEventListener('ready', readyHandler);

                document.body.append(el);
                await elementUpdated(el);

                expect(readyHandler).to.be.calledOnce;

                document.body.removeChild(el);
              },
            },
          },
        },

        // interaction tests
        interactions: {
          description: 'interactions',
          tests: {},
        },

        // style tests
        styles: {
          description: 'styles',
          tests: {
            directionStyles: {
              description: `should not use left/right styles that don't flip in RTL`,
              test: async () => {
                // this test just scans stylesheet text content, no need to run on all browsers
                if (!/chrome/i.test(navigator.userAgent)) return;

                const match = findUnsafeDirectionalCSS(this.component);
                expect(match.length, `Direction-specific styles found - ${JSON.stringify(match)}`).to.equal(0);
              },
            },
          },
        },
      },
    },
  };

  /**
   * This method executes all of the tests defined in the `tests` property in this test harness.
   * @param component The default setup for the component
   */
  public async runTests(component: (config?: any) => TemplateResult) {
    if (!component) {
      throw new Error('Please define a component to test.');
    }

    this.defaultComponent = component;
    await this.runComponentTests();
  }

  protected updateTests(tests: TestConfig) {
    function isObject(item: any) {
      return item && typeof item === 'object' && !Array.isArray(item);
    }

    function mergeDeep(target: any, ...sources: any) {
      if (!sources.length) return target;
      const source = sources.shift();

      if (isObject(target) && isObject(source)) {
        for (const key in source) {
          if (isObject(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            mergeDeep(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }

      return mergeDeep(target, ...sources);
    }
    this.tests = mergeDeep(this.tests, tests);
  }

  /**
   * Iterates over each of the tests defined in the `tests` property in this test harness and executes them.
   * @param config the group of tests to run for this component
   */
  protected async runComponentTests(config: TestConfig = this.tests) {
    Object.entries(config).forEach(async ([_, value]) => {
      if (typeof (value as ComponentTest).test === 'function') {
        await this.runTest(value as ComponentTest);
      } else {
        await this.runTestGroup(value as TestGroup);
      }
    });
  }

  /**
   * Runs an individual test.
   * @param test the test object to run
   */
  protected async runTest(test: ComponentTest) {
    if (test.skip) {
      return it.skip(test.description, async () => {});
    }

    if (test.only) {
      return it.only(test.description, async () => {
        await this.loadComponent(test);
        await (test.test as () => Promise<void>)();
      });
    }

    return it(test.description, async () => {
      await this.loadComponent(test);
      await (test.test as () => Promise<void>)();
    });
  }

  protected async loadComponent(test: ComponentTest) {
    this.component = await fixture<T>(this.defaultComponent!(spread(test.config || {})));
    await aTimeout(0); // Wait for initial render
  }

  /**
   * Runs a group of tests.
   * @param group the object of tests to run
   */
  protected async runTestGroup(group: TestGroup) {
    if (group.skip) {
      return describe.skip(group.description, () => this.runComponentTests(group.tests));
    }

    if (group.only) {
      return describe.only(group.description, () => this.runComponentTests(group.tests));
    }

    return describe(group.description, async () => {
      if (group.before) {
        before(group.before);
      }
      if (group.after) {
        after(group.after);
      }
      if (group.beforeEach) {
        beforeEach(group.beforeEach);
      }
      if (group.afterEach) {
        afterEach(group.afterEach);
      }

      await this.runComponentTests(group.tests);
    });
  }

  /**
   * Creates a new instance of the component with document.createElement. Adds a slotted trigger element to components
   * that require it.
   * @param component the component to create
   * @returns the new instance of the component
   */
  protected createCharmElement(component: T) {
    const baseName = project.scope.getBaseName(component);
    const el = document.createElement(component.tagName.toLowerCase());

    // popup fires errors if there is no anchor
    if (['popup', 'menu', 'tooltip'].includes(baseName)) {
      const trigger = document.createElement('button');
      switch (baseName) {
        case 'popup':
          trigger.slot = 'anchor';
          break;
        case 'menu':
          trigger.slot = 'trigger';
          break;
        default:
          // no slot attribute (default slot)
          break;
      }
      el.appendChild(trigger);
    }

    return el;
  }
}
