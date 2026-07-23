import { tokens } from '../utilities/theme.js';

function extractVarName(cssText: string, pathLabel: string): string {
  const match = cssText.match(/var\((--[^,\s)]+)/);
  if (!match) {
    throw new Error(`Unable to resolve CSS variable name for ${pathLabel}`);
  }
  return match[1];
}

export function getComponentVarName(component: string, token: string): string {
  const cssResult = tokens.lit.component(component, token);
  const cssText = (cssResult as unknown as { cssText?: string }).cssText ?? String(cssResult);
  return extractVarName(cssText, `${component}.${token}`);
}

export function setComponentVar(element: HTMLElement, component: string, token: string, value: string): string {
  const varName = getComponentVarName(component, token);
  element.style.setProperty(varName, value);
  return varName;
}
