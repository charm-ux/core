---
title: Testing
---

Each of the Charm components are tested for accessibility, behavior, and performance. Not only can you extend our components to customize, extend, and override our components, you can do the same with our tests.

## Test Setup

Charm uses [Web Test Runner](https://modern-web.dev/guides/test-runner/getting-started/) for testing. Your project should be able to get up and running with Charm's tests using the basic set-up guide and customize it to meet your needs.

## Reusing Tests

Each component has a test harness that contains everything you need to execute tests.

### Importing Tests

You can import the harness from the same location you import the component instance, but from the `{component name}.test-harness.js` file.

```ts
// my-component.test.ts
import { CoreComponentTests } from '@charm-ux/core/dist/components/core-component/core-component.test-harness.js';
import './index.js'; // import your component instance so it is initialized for the test browser instances
```

Now you can create a new instance of the tests. From that instance, you can run the `runTests` method. When you call that, you will pass it a tagged template instance of the component you want to test. This will serve as the default component for each of the tests.

```ts
// my-component.test.ts
const coreComponentTests = new CoreComponentTests();
coreComponentTests.runTests(config => html`<my-component ${config}></my-component`);
```

When you run your tests, the tests from the core project will be included in your library tests!

## Extending Tests

When adding new tests for your components, you can use the standard syntax for your tests and run them along with the tests inherited from the core project.

```ts
// my-component.test.ts
import { CoreComponentTests } from '@charm-ux/core/dist/components/core-component/core-component.test-harness.js';
import './index.js'; // import your component instance so it is initialized for the test browser instances
import type { MyComponent } from './my-component.js';

describe('some feature', () => {
  it('should add two numbers', async () => {
    const el = await fixture<MyComponent>(html`<my-component></my-component`);

    expect(el.add(1, 2)).to.equal(3);
  });
});

const coreComponentTests = new CoreComponentTests();
coreComponentTests.runTests(config => html`<my-component ${config}></my-component`);
```

The challenge with this approach is that if you ever want to extend this component within your project or allow others to extend your library, they cannot reuse your tests.

The test harness has a built-in mechanism to extend the tests inherited from core. In order to do that, you will extend the core test harness.

> **_NOTE:_** In order to avoid unintended test execution, you should add these tests in your own "test harness" file that is separate from your component test file that is executed by Web Test Runner.

```ts
// my-component.test-harness.ts
import { CoreComponentTests } from '@charm-ux/core/dist/components/core-component/core-component.test-harness.js';
import type { MyComponent } from './my-component.js';

export class MyComponentTests<T extends MyComponent> extends CoreComponentTests<T> {}
```

In this example, the new class uses a TypeScript generic. This will strongly type the `component` instance in the tests and provide autocomplete information and type-safety.

### Adding New Tests

All tests are configured in an object and are assigned to a `test` property in the test harness class. To extend them, we will use the spread operator to use the existing test and add a new object for tests.

```ts
// my-component.test-harness.ts
import { CoreComponentTests } from '@charm-ux/core/dist/components/core-component/core-component.test-harness.js';
import type { MyComponent } from './my-component.js';

export class MyComponentTests<T extends MyComponent> extends CoreComponentTests<T> {
  public constructor() {
    super();
    this.updateTests({
      // add new tests here
    });
  }
}
```

### Test Types

These tests are strongly typed to ensure proper configuration. All tests use a `TestConfig` to create tests. Within a `TestConfig`, there are 2 options for tests - `ComponentTest` and `TestGroup`.

```ts
/** Test configuration */
export type TestConfig = {
  [key: string]: ComponentTest | TestGroup;
};
```

```ts
/** Test for an individual component */
export type ComponentTest = {
  /** Description for test or group of tests */
  description: string;
  /** Skip test or group of tests */
  skip?: boolean;
  /** Only run this test or group of tests */
  only?: boolean;
  /** Logic for test */
  test: () => Promise<void> | (() => void);
  /** Test-specific component configuration */
  config?: {
    [key: string]: unknown;
  };
};
```

```ts
/** Group of tests for a component */
export type TestGroup = {
  /** Description for test or group of tests */
  description: string;
  /** Skip test or group of tests */
  skip?: boolean;
  /** Only run this test or group of tests */
  only?: boolean;
  /** Runs once before the first test in this block */
  before?: () => Promise<void> | (() => void);
  /** Runs once after the last test in this block */
  after?: () => Promise<void> | (() => void);
  /** Runs before each test in this block */
  beforeEach?: () => Promise<void> | (() => void);
  /** Runs after each test in this block */
  afterEach?: () => Promise<void> | (() => void);
  /** Group of tests */
  tests: TestConfig;
};
```

As you can see, these tests follow a similar pattern used in many JavaScript testing libraries:

- Provide descriptions
- Test block lifecycle hooks - `before`, `after`, `beforeEach`, and `afterEach`
- Skip tests using `skip`
- Run tests exclusively using `only`

### Component Instance

The test harness also provides an instance of the component used in the test using the `component` property. This property is types based on the type used in class's generic type.

### Add Previous Test

Using this pattern you can translate the test above to now extend the existing tests.

```ts
// my-component.test-harness.ts
import { CoreComponentTests } from '@charm-ux/core/dist/components/core-component/core-component.test-harness.js';
import type { MyComponent } from './my-component.js';

export class MyComponentTests<T extends MyComponent> extends CoreComponentTests<T> {
  public constructor() {
    super();
    this.updateTests({
      someFeature: {
        description: 'some feature',
        tests: {
          addNumbers: {
            description: 'should add two numbers',
            test: async () => {
              expect(this.component.add(1, 2)).to.equal(3);
            },
          },
        },
      },
    });
  }
}
```

Now that your tests are setup, you can import your test harness into your test file and execute them (along with the inherited tests) when you run your tests.

```ts
// my-component.test.ts
import { MyComponentTests } from './my-component.test-harness.js';
import './index.js'; // import your component instance so it is initialized for the test browser instances

const coreComponentTests = new MyComponentTests();
coreComponentTests.runTests(config => html`<my-component ${config}></my-component`);
```

## Overriding Tests

As you configure your components, you may change some things that will cause inherited tests to break. You can access those tests using the `tests` property and update, remove, or skip those tests.

### Skipping Tests

As you work to update tests, you may want to temporarily skip tests. you can use the `skip` property to skip a test or a group of tests.

```ts
export class MyComponentTests<T extends MyComponent> extends CoreComponentTests<T> {
  public constructor() {
    super();
    this.updateTests({
      // your tests
    });

    // skip feature test
    this.tests.coreComponent.tests.coreFeature.skip = true;
  }
}
```

### Update Tests

As you add new functionality and properties, you may want to override tests to meet your new API.

```ts
export class MyComponentTests<T extends MyComponent> extends CoreComponentTests<T> {
  public constructor() {
    super();
    this.updateTests({
      // your tests
    });

    // override feature test
    this.tests.coreComponent.tests.coreFeature.test = async () => {
      expect(this.component.newProperty).to.be.true;
    };
  }
}
```

### Remove Tests

On the rare occasion you want to remove a test you can either delete it completely or update it to run an empty method, but unless there isa really good reason, it is usually better to skip or override the test to ensure functionality isn't missed in the testing process.

```ts
export class MyComponentTests<T extends MyComponent> extends CoreComponentTests<T> {
  public constructor() {
    super();
    this.updateTests({
      // your tests
    });

    // remove test
    this.tests.coreComponent.tests.coreFeature.test = () => {};

    // delete test
    delete this.tests.coreComponent.tests.coreFeature;
  }
}
```

### Configuring Components

During testing values and content can be updated using the `this.component` property. The only down-side to this is that these values are set after the component has already been initialized. You may need to test the behavior or events when a component's attributes or properties are populated a certain way prior or during component composition. Each tests has a `config` property where attributes, properties, and events will be bound during component initialization.

```js
const tests = {
  myTest: {
    description: 'an example of how to set initial values on a component',
    test: async () => {
      expect(this.component.myProperty).to.equal('test');
    },
    config: {
      'my-attribute': 'foo',
      '?my-boolean-attribute': true,
      '@my-event': () => console.log('my-event fired'),
      '.myProperty': 'test',
    },
  },
};
```

When creating tests, you can control where the configuration gets placed using the `config` parameter from the test set-up.

```ts
coreComponentTests.runTests(
  config => html`
    <my-wrapper>
      <my-component ${config}></my-component>
    </my-wrapper>
  `
);
```
