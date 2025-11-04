---
title: Scoping
---

Because web components, or [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements), are registered globally at the page level, the problem of multiple versions of the same component colliding across features is a valid concern, particularly in SPAs. For example, if an app uses Charm 3.0 but a feature within the app uses 2.0, there will be a conflict because HTML tag names such as `<ch-button>` can only be registered once per page.

Thus, as a feature developer within the Charm ecosystem, you will likely need to "scope" your components using the technique described herein. By creating a scope, you can use the same components on the same page, even if they are completely different versions. We accomplish this be letting you define a custom suffix when the library is setup.

The default scope uses the `ch` prefix, so components will have HTML tag names such as `<ch-button>` and `<ch-card>`. When using a custom suffix, the tag names will look something like `<ch-button_suffix>` and `<ch-card_suffix>` instead.

> The default scope should only be used when you're absolutely certain there is no risk of collision with other versions of the library either in your app or anywhere your feature may be used. If in doubt, use a scope with a custom suffix.

## Creating a scope

The project utilizes a global scope. This scope has a default configuration but will require some updates to prevent issues when working with other projects that are also using Charm.

To create a custom scoping suffix, import the `createScope` function and provide it with a suffix. Note the scope **must** be created with the suffix before any components are imported. You can achieve this with the `defer` attribute on the script tag importing the components.

For example,

```html
<script type="module">
  import { createScope } from './node_modules/@charm-ux/core/dist/utilities/scope.js';
  createScope({
    // adds suffix to tags to prevent version collisions with other teams
    suffix: 'support',
  });
</script>
<script type="module" defer>
  import './node_modules/@charm-ux/core/dist/components/button/index.js';
  import './node_modules/@charm-ux/core/dist/components/card/index.js';
</script>

<!-- Now you can use <ch-button_support> and <ch-card_support> in your HTML! -->

<ch-button_support>Button with Custom Suffix</ch-button_support>
<ch-card_support heading="Card With Custom Suffix" subheading="This card has a _support suffix">
  Card Content
</ch-card_support>
```

## Theme

To ensure your components are using the correct version of theme css, use the [scoped-styles component](/components/scoped-styles/) to wrap them.
