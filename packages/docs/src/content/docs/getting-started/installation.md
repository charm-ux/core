---
title: Installation
---

To install the components from the package registry, run the following command (or use your preferred package manager):

```sh
npm install @charm-ux/core
```

### Include the theme

The library theme is a CSS stylesheet that provides default custom properties and styles for the components.

To use the theme, import the theme stylesheet in JavaScript (requires a bundler that resolves npm package sub-paths like Vite or Webpack):

```typescript
import '@charm-ux/core/theme/charm/theme.css';
```

Or link it directly if you're serving static files (copy from `node_modules/@charm-ux/core/dist/themes/charm/theme.css`):

```html
<link rel="stylesheet" href="/path/to/theme.css" />
```

Review the [theming documentation](/theming/) for more details on customizing the theme, as well as additional stylesheets you may want to include like a reset and dark mode.

### Use the components

Finally, import the components you want to use, and place the tag for the component in your application.

```html
<!-- import '@charm-ux/core/components/button/index.js'; -->

<ch-button>My button</ch-button>
```
