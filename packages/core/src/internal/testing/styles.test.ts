import { expect } from '@open-wc/testing';
import { findUnsafeDirectionalCSS } from './styles.js';

describe('findUnsafeDirectionalCSS', () => {
  it('finds physical properties inside nested at-rules', () => {
    const element = document.createElement('div');
    const shadowRoot = element.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('@media (min-width: 1px) { .dialog { right: 0; float: left; } }');
    shadowRoot.adoptedStyleSheets = [sheet];

    const matches = findUnsafeDirectionalCSS(element as never);

    expect(matches).to.have.length(1);
    expect(matches[0]?.selector).to.equal('.dialog');
    expect(matches[0]?.properties.join(' ')).to.contain('right:');
    expect(matches[0]?.properties.join(' ')).to.contain('float: left');
  });
});
