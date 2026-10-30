import { expect } from '@open-wc/testing';
import { minifyCssString } from './helpers.js';
import { tokens } from './theme.js';

describe('CSS string helpers', () => {
  it('preserves whitespace that changes selector and declaration meaning', () => {
    const css = '.a\n.b { margin: 0  auto; }';
    expect(minifyCssString(css)).to.equal(css);
  });

  it('removes block comments without joining neighboring tokens', () => {
    expect(minifyCssString('.a { color: red; } /* note */ .b { color: blue; }')).to.equal(
      '.a { color: red; }  .b { color: blue; }'
    );
  });
});

describe('theme token helpers', () => {
  it('escapes numeric decimal segments in CSS variable names', () => {
    expect(tokens.prop.primitive('spacing', 0.5)).to.equal('--charm-spacing-0\\.5');
  });
});
