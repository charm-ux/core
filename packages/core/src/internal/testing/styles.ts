import CharmElement from '../../base/charm-element/charm-element.js';

/**
 * These styles have options like "start", "end", "inline-start", or "inline-end" rather than "left" or "right" that
 * should be used instead. If it really is necessary, make sure you have corresponding ltr and rtl styles and add an
 * array with the selectors used for rules you want to exclude, exactly (with spaces rather than new lines), as the
 * second parameter of this function in your test.
 */
export function findUnsafeDirectionalCSS(el: CharmElement, excludeSelector?: string[]) {
  const styleSheets: CSSStyleSheet[] = el.shadowRoot?.adoptedStyleSheets || [];
  const regex = new RegExp(
    '(text-align: (left|right))|(padding-(left|right))|(margin-(left|right)|(border-(left|right)))',
    'gm'
  );

  const matches: {
    selector: string;
    properties: RegExpMatchArray;
  }[] = [];

  for (const styleSheet of styleSheets) {
    for (const rule of styleSheet.cssRules) {
      if (rule instanceof CSSStyleRule && (!excludeSelector || !excludeSelector.includes(rule.selectorText))) {
        const match = rule.cssText.match(regex);

        if (match) {
          matches.push({
            selector: rule.selectorText,
            properties: match,
          });
        }
      }
    }
  }

  if (matches.length) {
    console.warn(`${el.tagName.toLowerCase()} direction-specific styles:`, matches);
  }

  return matches;
}
