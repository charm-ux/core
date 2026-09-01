import { mkdirSync, writeFileSync } from 'node:fs';
import { charmTokens, defineTokens } from '../dist/index.js';
import { generateThemeSync } from '../dist/generator/index.js';

// Helper to write all theme outputs
function writeThemeAssets(name, theme) {
  const dir = `./demo/themes/${name}`;
  mkdirSync(dir, { recursive: true });

  writeFileSync(`${dir}/tokens.css`, theme.css);
  writeFileSync(`${dir}/reset.css`, theme.cssReset);
  writeFileSync(`${dir}/utilities.css`, theme.cssUtilities);

  // Themes with light/dark tokens emit split JSON files; others emit a single one.
  if (theme.tokensJson) {
    writeFileSync(`${dir}/tokens.json`, theme.tokensJson);
  }
  if (theme.tokensLightJson) {
    writeFileSync(`${dir}/tokens.light.json`, theme.tokensLightJson);
  }
  if (theme.tokensDarkJson) {
    writeFileSync(`${dir}/tokens.dark.json`, theme.tokensDarkJson);
  }

  writeFileSync(`${dir}/TOKENS.md`, theme.tokensMarkdown);

  const jsonForCount = theme.tokensJson ?? theme.tokensLightJson;
  const colors = jsonForCount ? JSON.parse(jsonForCount).primitives?.color : undefined;
  const colorPalettes = colors ? Object.keys(colors).length : 0;

  console.log(`Generated ${name}:`);
  console.log(`  - tokens.css (${theme.css.split('\n').length} lines)`);
  console.log(`  - reset.css (${theme.cssReset.split('\n').length} lines)`);
  console.log(`  - utilities.css (${theme.cssUtilities.split('\n').length} lines)`);
  console.log(`  - tokens.json (${colorPalettes} color palettes)`);
  console.log(`  - TOKENS.md (${theme.tokensMarkdown.split('\n').length} lines)`);
}

// 1. Pre-built Charm Theme
console.log('\n--- Pre-built Charm Theme ---');
writeThemeAssets('charm', generateThemeSync(charmTokens.definition, { prefix: 'charm' }));

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
  semantics: ({ primitive }) => ({
    body: {
      bgColor: { light: '#ffffff', dark: '#1a1a1a' },
      fgColor: { light: '#1a1a1a', dark: '#ffffff' },
    },
    button: {
      bgColor: { light: primitive('color', 'neutral', 200), dark: primitive('color', 'neutral', 800) },
      fgColor: { light: '#1a1a1a', dark: '#ffffff' },
      borderRadius: primitive('borderRadius', 'md'),
    },
  }),
});

const customTheme = generateThemeSync(customDefinition, { prefix: 'custom' });
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

const minimalTheme = generateThemeSync(minimalDefinition);
writeThemeAssets('minimal', minimalTheme);

console.log('\n--- Demo Complete ---\n');
