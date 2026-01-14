---
title: Usage
---

Library components are HTML elements at their core, so they can be used in the same way as any other HTML element. The only difference is that they are [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)—also known as web components—which means they are defined by the library and not part of native HTML.

While the full documentation for each component describes their API in detail, this page provides a general overview of how to use components in your project by describing the foundational integration aspects.

If you are new to web components, this guide will help familiarize you with the basic concepts.

> **Note**: Each component has its own unique aspects and may not include each of the features described here. Be sure to refer to the specific component's documentation for more detailed information.

See the [Installation docs](/getting-started/installation/) for how to install the components and include the theme if you haven't already.

## Naming Conventions

Web components must have hyphenated tag names to differentiate them from standard HTML elements, so Charm components all begin with `ch-`, for example:

```html
<ch-button icon-only><ch-icon name="warning"></ch-icon></ch-button>
```

Note custom elements **must** contain a closing tag, they cannot be self-closing.

## Attributes

Attributes are used to set key value pairs in HTML on an element and are the primary way to configure the component's behavior and appearance.

For example, cards accept a `title` attribute to define their heading title:

```html
<ch-card title="Card Heading"></ch-card>
```

Just like other HTML attributes, component attributes either accept a string value, or indicate a boolean value by their presence or absence, where the presence of the attribute indicates `true`.

```html
<!-- This button is disabled -->
<ch-button disabled>My button</ch-button>
```

## Properties

Properties are key value pairs defined on a JavaScript object and are used to get or set the component's state or configuration. They can be used to dynamically update the component's behavior.

**Properties are unique from attributes** because they can accept any JavaScript value, not just strings. This allows for more complex data to be passed to the component in the form of objects, arrays, or functions. Additionally, updates to properties do not trigger a change to the DOM.

To interact with a component's properties, you can use the component's JavaScript API. For example, to get the validity of an input component, you can access the `validity` property:

```html
<ch-input id="input"></ch-input>

<script type="module">
  const input = document.getElementById('input');

  console.log(input.validity.valid ? 'Valid' : 'Invalid');
</script>
```

All attributes have a corresponding property. Some components have explicit properties in addition to attributes, so be sure to check the specific component's documentation for more information.

## Slots

Slots are used to define the content of a component. They are placeholders that allow you to insert content and elements — including other components — into the component's template.

For example, the `ch-button` component has a default slot that allows you to define the button's label. This default slot doesn't need explicitly defined, it's simply the component's content:

```html
<ch-button>My button</ch-button>
```

You can also use named slots, which are used to define specific areas of the component's template. For example, the button component has a `start` slot that allows placing content, such as an icon, at the start of the button.

```html
<ch-button>
  <ch-icon slot="start" name="warning"></ch-icon>
  Profile
</ch-button>
```

Named slots do not need to be placed in the same order as they are defined in the component's template. They can be placed anywhere within the component's content, meaning the `start` slot could be included after the default content in your markup and still render in the correct place.

## Events

Since components are custom HTML elements, standard events such as `click` or `mouseover` can be used with them. However, components also dispatch custom events to notify you of changes or interactions. Use `addEventListener` to listen for these events in your application, or whatever mechanism your framework provides for event handling. Note that all of our events bubble.

You can listen for these events in your application to respond to the component's behavior.

```html
<ch-button id="click-me">Click</ch-button>

<script type="module">
  const button = document.getElementById('click-me');

  button.addEventListener('click', event => {
    console.log('Clicked!');
  });
</script>
```

When a component replaces a native element, the naming convention follows the native element's event name. For example, the `ch-input` component emits a `change` event when the value of the input changes, just like a native input element would.

In addition, some components emit custom events. These work the same way as standard events but are prefixed with the component's name to prevent collisions with standard events and other libraries. For example, the `ch-tooltip` component emits a `tooltip-show` event when the tooltip begins to show.

```html
<ch-tooltip id="tooltip" content="This is a tooltip!">
  <ch-button>Hover me</ch-button>
</ch-tooltip>

<script type="module">
  const tooltip = document.getElementById('tooltip');

  tooltip.addEventListener('tooltip-show', event => {
    console.log('Tooltip is becoming visible');
  });
</script>
```

## Methods

Components may expose methods that allow you to interact with them programmatically. These methods can be used to perform actions on the component, such as showing a dialog.

To call a method on a component, you can use the component's JavaScript API. For example, to open a dialog, you can call the `show` method on the dialog component:

```html
<ch-dialog id="dialog">
  <p>This is the dialog content</p>
</ch-dialog>

<ch-button id="openBtn">Open dialog</ch-button>

<script type="module">
  const dialog = document.getElementById('dialog');
  const openBtn = document.getElementById('openBtn');

  openBtn.addEventListener('click', () => dialog.show());
</script>
```

## CSS custom properties

Most components expose CSS custom properties that allow you to customize their appearance beyond the inherited semantic token values from the theme. The custom properties that apply to specific components are scoped to the component, such as `--button-[property]` for buttons.

We caution you to only use these custom properties when necessary, as frequent use can make your styles more difficult to maintain. They are intended for use cases where you need to override a specific aspect of the component's appearance in a way that is not intended to apply globally.

> **Note:** If you do want global overrides for the semantic tokens applied to component styles, we recommend using the theme system to define your custom values. This ensures that your customizations are consistent across all components that use the theme. Theme guidance is coming soon.

Custom properties are inheritable, meaning they can be set on a parent or host element, or even the `:root` element, to apply to all instances of the component.

Since custom elements still allow for use of classes, you may wish to make your adjustments via your own utility class. For example, the `ch-button` component exposes a `--button-bg-color` custom property that allows you to set the button's background color, so we can apply it with a class.

```html
<style>
  .ch-button-blue {
    --button-bg-color: blue;
  }
</style>

<ch-button class="ch-button-blue">Blue button</ch-button>
```

For stateful components like buttons, you're also responsible for any adjustments to the component's appearance when it is in a different state, such as `:hover` or `:active`. You may also need to re-validate contrast requirements when making customizations to ensure accessibility.

## CSS parts

The components use a [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) to encapsulate their styles and behaviors. Whereas custom properties can pierce the shadow DOM (in other words, are inheritable from outside), other CSS selectors to target component internals have no effect.

Instead, components expose parts that can be targeted with the [CSS part selector](https://developer.mozilla.org/en-US/docs/Web/CSS/::part), or `::part()`. Parts are available to provide styling hooks for specific elements within the component. They allow more flexibility as they are not limited to custom properties and can be used to target any part of the component's template that is exposed as a part.

In this example, the button's `content` part, which encompasses the button's label, is targeted to apply a custom style:

```css
ch-button::part(content) {
  font-weight: bold;
}
```

At first glance, this approach might seem a bit verbose or even limiting, but it comes with a few important advantages:

- Customizations can be made to components with explicit selectors, such as `::part(icon)`, rather than implicit selectors, such as `.button > div > span + .icon`, that are much more fragile.
- The internal structure of a component will likely change as it evolves. By exposing component parts through an API, the internals can be reworked without fear of breaking customizations as long as its parts remain intact.
- It encourages us to think more about how components are designed and how customizations should be allowed before users can take advantage of them. Once we opt a part into the component's API, it's guaranteed to be supported and can't be removed until a major version of the library is released.
