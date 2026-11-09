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

/**
 * A component state that gets its own axe test (see `addAccessibilityStates`). Each state that changes rendered
 * semantics — open, expanded, invalid, disabled, checked, selected, etc. — must be scanned on its own, because the
 * base accessibility test only scans the initial render.
 */
export type AccessibilityState<T> = BaseTest & {
  /**
   * Puts the component into the state under test. Return an element to scan a different root, such as a semantic parent
   * fixture when the component's role depends on composition; otherwise the component itself is scanned.
   */
  setup: (el: T) => Promise<Element | void> | Element | void;

  /** axe rules to skip for this state, in addition to `accessibilityIgnoredRules`. Justify each one in a comment. */
  ignoredRules?: string[];
};

export class CharmElementTests<T extends CharmElement> {
  /** Global component reference to be used in each test. Default to a `div` to reduce optional chaining */
  protected component: T = document.createElement('div') as unknown as T;

  /** Initial component setup when components are executed. This will be used to reset the component for each test. */
  protected defaultComponent?: (config?: any) => TemplateResult;

  /** axe rules skipped by the base accessibility test and every accessibility state test. */
  // Components may intentionally expose ARIA roles not in axe's built-in role registry.
  protected accessibilityIgnoredRules: string[] = ['aria-allowed-role'];

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
            await expect(this.component).to.be.accessible({ ignoredRules: this.accessibilityIgnoredRules });
          },
        },

        // One axe test per component state, registered with `addAccessibilityStates`
        accessibilityStates: {
          description: 'accessibility states',
          tests: {},
        },

        // attribute and property tests
        properties: {
          description: 'properties',
          tests: {
            componentAttribute: {
              description: 'should have an attribute that matches the component name',
              test: async () => {
                const attr = this.component.hasAttribute(project.scope.getBaseName(this.component));
                expect(attr).to.be.true;
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
   * Registers a separate axe test for each component state. Add one entry for every state that changes the rendered
   * semantics (open, expanded, invalid, disabled, checked, selected, multiple with values, etc.) so a violation that
   * only appears in that state fails its own test.
   * @param states the states to scan, keyed by a unique test name
   */
  protected addAccessibilityStates(states: Record<string, AccessibilityState<T>>) {
    const tests: TestConfig = {};

    Object.entries(states).forEach(([key, { setup, ignoredRules = [], ...state }]) => {
      tests[key] = {
        ...state,
        description: `should be accessible ${state.description}`,
        test: async () => {
          const target = (await setup(this.component)) ?? this.component;
          await elementUpdated(this.component);
          await expect(target).to.be.accessible({
            ignoredRules: [...this.accessibilityIgnoredRules, ...ignoredRules],
          });
        },
      };
    });

    const group = (this.tests.base as TestGroup).tests.accessibilityStates as TestGroup;
    Object.assign(group.tests, tests);
  }

  /**
   * Iterates over each of the tests defined in the `tests` property in this test harness and executes them.
   * @param config the group of tests to run for this component
   */
  protected runComponentTests(config: TestConfig = this.tests) {
    Object.entries(config).forEach(([_, value]) => {
      if (typeof (value as ComponentTest).test === 'function') {
        this.runTest(value as ComponentTest);
      } else {
        this.runTestGroup(value as TestGroup);
      }
    });
  }

  /**
   * Runs an individual test.
   * @param test the test object to run
   */
  protected runTest(test: ComponentTest) {
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
  protected runTestGroup(group: TestGroup) {
    const suite = group.skip ? describe.skip : group.only ? describe.only : describe;
    return suite(group.description, () => {
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

      this.runComponentTests(group.tests);
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
