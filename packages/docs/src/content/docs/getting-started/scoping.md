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
  import { createScope } from '@charm-ux/core/utilities/scope';
  createScope({
    // adds suffix to tags to prevent version collisions with other teams
    suffix: 'support',
  });
</script>
<script type="module" defer>
  import '@charm-ux/core/components/button/index.js';
  import '@charm-ux/core/components/card/index.js';
</script>

<!-- Now you can use <ch-button_support> and <ch-card_support> in your HTML! -->

<ch-button_support>Button with Custom Suffix</ch-button_support>
<ch-card_support heading="Card With Custom Suffix" subheading="This card has a _support suffix">
  Card Content
</ch-card_support>
```

### Authoring components

When authoring Charm components, use the scoped tag form whenever your template references another custom element. In practice, that means writing `<scoped-*>` tags inside `this.html` templates instead of interpolating `${this.scope.tag('...')}` for each nested component.

```text
render() {
  return this.html`<scoped-icon ... /><scoped-button>Click me</scoped-button>`;
}
```

This pattern is important for two reasons:

- When extending a component library, it keeps your component templates aligned with the host scope automatically. That prevents hard-coded tag names from bypassing the scope registry and makes the component work correctly in scoped environments.
- When creating suffixes for scoped components within an existing system, it ensures nested components resolve to the same scoped tag name as the host component. That keeps a component tree consistent even when multiple versions of Charm coexist on the page.

For polymorphic tags such as `<a>` versus `<button>`, keep using `literal` or `unsafeStatic` from `lit/static-html.js` alongside `this.html`.

## Theme

To ensure your components are using the correct version of theme css, use the [scoped-styles component](/components/scoped-styles/) to wrap them.
