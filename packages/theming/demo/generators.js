import { defineTokens, generateTheme, charmTokens } from '../dist/index.js';
import { writeFileSync, mkdirSync } from 'node:fs';

// Helper to write all theme outputs
function writeThemeAssets(name, theme) {
  const dir = `./demo/themes/${name}`;
  mkdirSync(dir, { recursive: true });

  writeFileSync(`${dir}/tokens.css`, theme.css);
  writeFileSync(`${dir}/reset.css`, theme.cssReset);
  writeFileSync(`${dir}/utilities.css`, theme.cssUtilities);
  writeFileSync(`${dir}/tokens.json`, theme.tokensJson);
  writeFileSync(`${dir}/TOKENS.md`, theme.tokensMarkdown);

  console.log(`Generated ${name}:`);
  console.log(`  - tokens.css (${theme.css.split('\n').length} lines)`);
  console.log(`  - reset.css (${theme.cssReset.split('\n').length} lines)`);
  console.log(`  - utilities.css (${theme.cssUtilities.split('\n').length} lines)`);
  console.log(
    `  - tokens.json (${JSON.parse(theme.tokensJson).color ? Object.keys(JSON.parse(theme.tokensJson).color).length : 0} color palettes)`
  );
  console.log(`  - TOKENS.md (${theme.tokensMarkdown.split('\n').length} lines)`);
}

// 1. Pre-built Charm Theme
console.log('\n--- Pre-built Charm Theme ---');
writeThemeAssets('charm', charmTokens.theme);

// 2. Custom Theme with defineTokens
console.log('\n--- Custom Theme ---');
const { definition: customDefinition } = defineTokens({
  primitives: {
    color: {
      primary: '#0f6cbd',
      danger: '#C50F1F',
      neutral: '#808080',
    },
    spacing: {
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.1)',
      md: '0 4px 8px rgba(0,0,0,0.15)',
    },
    typography: {
      fontFamily: {
        base: 'system-ui, sans-serif',
        mono: 'monospace',
      },
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
      },
      fontWeight: {
        normal: '400',
        bold: '700',
      },
    },
    zIndex: {
      base: '0',
      modal: '100',
    },
  },
  semantics: ref => ({
    body: {
      bgColor: { light: '#ffffff', dark: '#1a1a1a' },
      fgColor: { light: '#1a1a1a', dark: '#ffffff' },
    },
    button: {
      bgColor: { light: ref('color', 'neutral', 200), dark: ref('color', 'neutral', 800) },
      fgColor: { light: '#1a1a1a', dark: '#ffffff' },
      borderRadius: ref('borderRadius', 'md'),
    },
  }),
});

const customTheme = generateTheme(customDefinition, { prefix: 'custom' });
writeThemeAssets('custom', customTheme);

// 3. Minimal Theme (just primitives)
console.log('\n--- Minimal Theme ---');
const { definition: minimalDefinition } = defineTokens({
  primitives: {
    color: {
      brand: '#ff6600',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
    },
  },
});

const minimalTheme = generateTheme(minimalDefinition);
writeThemeAssets('minimal', minimalTheme);

console.log('\n--- Demo Complete ---\n');
