# Charm UX

A modern, accessible, and customizable web component library built with Lit. Charm provides a comprehensive set of headless UI components and theming utilities to help you build beautiful, performant design systems.

## ✨ Features

- **🎨 Fully Themable** - Built-in theming system with design token support
- **♿ Accessible by Default** - WCAG compliant components with proper ARIA attributes
- **🚀 Framework Agnostic** - Works with React, Vue, Angular, or vanilla JavaScript
- **📦 Tree-Shakeable** - Import only what you need
- **⚡ Built with Lit** - Leverages the power of modern web standards
- **🎯 Type-Safe** - Full TypeScript support
- **🧪 Well Tested** - Comprehensive test coverage

## 📦 Packages

This monorepo contains the following packages:

- **[@charm-ux/core](./packages/core)** - Core component library
- **[@charm-ux/theming](./packages/theming)** - Theme generation and design token utilities
- **[docs](./packages/docs)** - Documentation and component showcase

## 🚀 Quick Start

### Installation

```bash
npm install @charm-ux/core @charm-ux/theming
```

```bash
pnpm add @charm-ux/core @charm-ux/theming
```

```bash
yarn add @charm-ux/core @charm-ux/theming
```

### Basic Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import '@charm-ux/core/components/button/button.js';
    </script>
  </head>
  <body>
    <charm-button>Click Me</charm-button>
  </body>
</html>
```

### Using with JavaScript

```javascript
import { CharmButton } from '@charm-ux/core';

// Components are automatically registered
const button = document.createElement('charm-button');
button.textContent = 'Click Me';
document.body.appendChild(button);
```

### Using with TypeScript

```typescript
import { CharmButton } from '@charm-ux/core';

const button = new CharmButton();
button.textContent = 'Click Me';
button.variant = 'primary';
document.body.appendChild(button);
```

## 🧩 Available Components

Charm includes a comprehensive set of UI components:

### Layout & Structure

- **Card** - Flexible content containers
- **Divider** - Visual content separators
- **Push Pane** - Sliding panel component

### Navigation

- **Breadcrumb** & **Breadcrumb Item** - Navigation hierarchy
- **Menu**, **Menu Group**, & **Menu Item** - Contextual menus
- **Tabs**, **Tab**, & **Tab Panel** - Tabbed interfaces

### Form Controls

- **Button** & **Button Group** - Action triggers
- **Checkbox** - Boolean selection
- **Input** - Text input fields
- **Radio** & **Radio Group** - Single selection
- **Select** - Dropdown selection
- **Switch** - Toggle control
- **Text Area** - Multi-line text input

### Feedback

- **Alert** - Contextual messages
- **Dialog** - Modal dialogs
- **Progress Bar** - Progress indicators
- **Spinner** - Loading indicators
- **Tooltip** - Contextual hints
- **Skeleton** - Loading placeholders

### Data Display

- **Avatar** - User avatars
- **Badge** - Labels and tags
- **Icon** - Iconography

### Utilities

- **Accordion** & **Accordion Item** - Collapsible content
- **Disclosure** - Show/hide content
- **Overflow** - Handle content overflow
- **Popup** - Positioned floating elements
- **Scoped Styles** - Component-specific styling

## 🎨 Theming

Charm uses a powerful theming system based on design tokens:

```typescript
import { generateTheme } from '@charm-ux/theming';

const theme = generateTheme({
  primaryColor: '#0066cc',
  secondaryColor: '#6c757d',
  // ... more token configurations
});

// Apply theme to your application
document.documentElement.style.cssText = theme;
```

## 🛠️ Development

### Prerequisites

- Node.js 20 or higher. For consistency with CI, use the recommended version pinned in [.nvmrc](.nvmrc).
- pnpm 8 or higher

### Setup

1. Clone the repository:

```bash
git clone https://github.com/charm-ux/core.git
cd core
```

2. Install dependencies:

```bash
pnpm install
```

3. Build all packages:

```bash
pnpm run build
```

### Development Commands

```bash
# Start development server for core components
pnpm run dev:core

# Start documentation site
pnpm run dev:docs

# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Lint code
pnpm run lint

# Format code
pnpm run prettier

# Generate a new component
pnpm run generate
```

## 🧪 Testing

Charm has comprehensive test coverage using Web Test Runner and Playwright:

```bash
# Run all tests
pnpm run test

# Run core package tests only
pnpm run test:core

# Run performance tests
pnpm run test:core-performance

# Run tests in watch mode
pnpm run test:watch
```

## 📖 Documentation

Visit our [documentation site](./packages/docs) for:

- Component API documentation
- Usage examples
- Theming guides
- Accessibility information
- Migration guides

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Development setup
- Code style guidelines
- Submitting pull requests
- Creating changesets

## 📄 License

MIT © [charm-ux](https://github.com/charm-ux)

## 🙏 Acknowledgments

Built with:

- [Lit](https://lit.dev/) - Modern web component framework
- [Floating UI](https://floating-ui.com/) - Positioning engine
- [Storybook](https://storybook.js.org/) - Component development

---

**Made with ❤️ by the Charm UX team**
