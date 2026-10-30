import CharmElement from '../../base/charm-element/charm-element.js';

/**
 * These styles have options like "start", "end", "inline-start", or "inline-end" rather than "left" or "right" that
 * should be used instead. If it really is necessary, make sure you have corresponding ltr and rtl styles and add an
 * array with the selectors used for rules you want to exclude, exactly (with spaces rather than new lines), as the
 * second parameter of this function in your test.
 */
/** @deprecated Test-only helper; import from the testing subpath instead of the production internal barrel. */
export function findUnsafeDirectionalCSS(el: CharmElement, excludeSelector?: string[]) {
  const styleSheets: CSSStyleSheet[] = el.shadowRoot?.adoptedStyleSheets || [];
  const regex =
    /(?:text-align:\s*(?:left|right))|(?:(?:padding|margin|border)-(?:left|right)(?:-[\w-]+)?:)|(?:(?:^|[;{])\s*(?:left|right)\s*:\s*[^;}]+)|(?:float:\s*(?:left|right))/gim;

  const matches: {
    selector: string;
    properties: RegExpMatchArray;
  }[] = [];

  const visitRules = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        if (excludeSelector?.includes(rule.selectorText)) continue;
        const match = rule.cssText.match(regex);
        if (match) matches.push({ selector: rule.selectorText, properties: match });
      } else if ('cssRules' in rule) {
        visitRules((rule as CSSGroupingRule).cssRules);
      }
    }
  };

  for (const styleSheet of styleSheets) visitRules(styleSheet.cssRules);

  if (matches.length) {
    console.warn(`${el.tagName.toLowerCase()} direction-specific styles:`, matches);
  }

  return matches;
}
