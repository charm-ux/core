/** @arg {import('plop').NodePlopAPI} plop */

const PACKAGE_PATHS = {
  core: 'packages/core',
  demo: 'packages/demo',
  docs: 'packages/docs',
};

const CORE_PATHS = {
  components: `${PACKAGE_PATHS.core}/src/components`,
  demo: `${PACKAGE_PATHS.demo}/src/components`,
  examples: `${PACKAGE_PATHS.docs}/src/content/docs/components`,
};

const WARN = {
  naming:
    'Component name must start with a letter, can only contain alphanumeric characters and dashes, and not end in a dash. Please enter the name again.',
};

export default function (plop) {
  plop.setHelper('dashToTitle', text => {
    const titleCase = plop.getHelper('titleCase');
    return titleCase(text.replace(/-/g, ' '));
  });

  plop.setGenerator('Core component', {
    description: 'Create a new Core component and its documentation.',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Please enter the name for the component in kebab-case (e.g. button-group)',
        default: '',
      },
    ],
    actions: function (data) {
      const basename = data?.name;
      if (
        // Must only contain alphanumeric characters and dashes
        !/[a-z0-9-]+/.test(basename) ||
        // Must start with a letter
        !/^[a-z]/.test(basename) ||
        // Must not end in a dash
        basename.endsWith('-')
      ) {
        console.log(
          'Component name must start with a letter, can only contain alphanumeric characters and dashes, and not end in a dash. Please enter the name again.'
        );
        return [];
      }

      const corePackage = `${CORE_PATHS.components}/{{kebabCase name}}`;

      return [
        /* Core Component */
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.ts`,
          templateFile: 'plop-templates/core/component.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.performance.ts`,
          templateFile: 'plop-templates/core/component.performance.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.styles.ts`,
          templateFile: 'plop-templates/core/component.styles.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.test.ts`,
          templateFile: 'plop-templates/core/component.test.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.test-harness.ts`,
          templateFile: 'plop-templates/core/component.test-harness.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.html.stories.ts`,
          templateFile: 'plop-templates/core/component.html.stories.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/index.ts`,
          templateFile: 'plop-templates/core/component.scope.ts.hbs',
        },
        {
          type: 'append',
          path: `${CORE_PATHS.components}/index.ts`,
          separator: '',
          template: `export * from './{{kebabCase name}}/{{kebabCase name}}.js';`,
        },
        /* Docs */

        {
          type: 'add',
          skipIfExists: true,
          path: `${CORE_PATHS.examples}/{{kebabCase name}}.mdx`,
          templateFile: 'plop-templates/core/component.docs.hbs',
        },
      ];
    },
  });

  plop.setGenerator('Demo component', {
    description: 'Create a new Demo component and its documentation.',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Please enter the name for the component in kebab-case (e.g. button-group)',
        default: '',
      },
    ],
    actions: function (data) {
      const basename = data?.name;
      if (
        // Must only contain alphanumeric characters and dashes
        !/[a-z0-9-]+/.test(basename) ||
        // Must start with a letter
        !/^[a-z]/.test(basename) ||
        // Must not end in a dash
        basename.endsWith('-')
      ) {
        console.log(WARN.naming);
        return [];
      }

      const demoPackage = `${CORE_PATHS.demo}/{{kebabCase name}}`;

      return [
        /* Demo component */
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.ts`,
          templateFile: 'plop-templates/demo/component.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.styles.ts`,
          templateFile: 'plop-templates/demo/component.styles.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.html.stories.ts`,
          templateFile: 'plop-templates/demo/component.html.stories.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.react.stories.tsx`,
          templateFile: 'plop-templates/demo/component.react.stories.tsx.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/index.ts`,
          templateFile: 'plop-templates/demo/component.scope.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.test.ts`,
          templateFile: 'plop-templates/demo/component.test.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.test-harness.ts`,
          templateFile: 'plop-templates/demo/component.test-harness.ts.hbs',
        },
        {
          type: 'append',
          path: `${CORE_PATHS.demo}/index.ts`,
          separator: '',
          template: `export * from './{{kebabCase name}}/{{kebabCase name}}.js';`,
        },

        /* Docs */
        {
          type: 'add',
          skipIfExists: true,
          path: `${CORE_PATHS.examples}/{{kebabCase name}}.mdx`,
          templateFile: 'plop-templates/core/component.docs.hbs',
        },
      ];
    },
  });

  plop.setGenerator('Component set', {
    description: 'Create new components for both Core and Demo and accompanying documentation.',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Please enter your component name in kebab-case (e.g. button-group)',
        default: '',
      },
    ],
    actions: function (data) {
      const basename = data?.name;
      if (
        // Must only contain alphanumeric characters and dashes
        !/[a-z0-9-]+/.test(basename) ||
        // Must start with a letter
        !/^[a-z]/.test(basename) ||
        // Must not end in a dash
        basename.endsWith('-')
      ) {
        console.log(WARN.naming);
        return [];
      }

      const corePackage = `${CORE_PATHS.components}/{{kebabCase name}}`;
      const demoPackage = `${CORE_PATHS.demo}/{{kebabCase name}}`;

      return [
        /* Core package */
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.ts`,
          templateFile: 'plop-templates/core/component.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.performance.ts`,
          templateFile: 'plop-templates/core/component.performance.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.styles.ts`,
          templateFile: 'plop-templates/core/component.styles.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.test.ts`,
          templateFile: 'plop-templates/core/component.test.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.test-harness.ts`,
          templateFile: 'plop-templates/core/component.test-harness.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/{{kebabCase name}}.html.stories.ts`,
          templateFile: 'plop-templates/core/component.html.stories.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${corePackage}/index.ts`,
          templateFile: 'plop-templates/core/component.scope.ts.hbs',
        },
        {
          type: 'append',
          path: `${CORE_PATHS.components}/index.ts`,
          separator: '',
          template: `export * from './{{kebabCase name}}/{{kebabCase name}}.js';`,
        },

        /* Demo package */

        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.ts`,
          templateFile: 'plop-templates/demo/component.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.styles.ts`,
          templateFile: 'plop-templates/demo/component.styles.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.html.stories.ts`,
          templateFile: 'plop-templates/demo/component.html.stories.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.react.stories.tsx`,
          templateFile: 'plop-templates/demo/component.react.stories.tsx.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/index.ts`,
          templateFile: 'plop-templates/demo/component.scope.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.test.ts`,
          templateFile: 'plop-templates/demo/component.test.ts.hbs',
        },
        {
          type: 'add',
          skipIfExists: true,
          path: `${demoPackage}/{{kebabCase name}}.test-harness.ts`,
          templateFile: 'plop-templates/demo/component.test-harness.ts.hbs',
        },
        {
          type: 'append',
          path: `${CORE_PATHS.demo}/index.ts`,
          separator: '',
          template: `export * from './{{kebabCase name}}/{{kebabCase name}}.js';`,
        },

        /* Docs */
        {
          type: 'add',
          skipIfExists: true,
          path: `${CORE_PATHS.examples}/{{kebabCase name}}.mdx`,
          templateFile: 'plop-templates/core/component.docs.hbs',
        },
      ];
    },
  });

  plop.setGenerator('Documentation only', {
    description: `Create ONLY a component's documentation page.`,
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Please enter your component name in kebab-case (e.g. button-group)',
        default: '',
      },
    ],
    actions: function (data) {
      const basename = data?.name;
      if (
        // Must only contain alphanumeric characters and dashes
        !/[a-z0-9-]+/.test(basename) ||
        // Must start with a letter
        !/^[a-z]/.test(basename) ||
        // Must not end in a dash
        basename.endsWith('-')
      ) {
        console.log(WARN.naming);
        return [];
      }

      return [
        {
          type: 'add',
          skipIfExists: true,
          path: `${CORE_PATHS.examples}/{{kebabCase name}}.md`,
          templateFile: 'plop-templates/core/component.docs.hbs',
        },
      ];
    },
  });
}
