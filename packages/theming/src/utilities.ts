/**
 * Checks if a value is a number
 * @param value
 * @returns boolean
 */
export function isNumber(value: any) {
  return !isNaN(parseFloat(value)) && !isNaN(value - 0);
}

/**
 * Converts a string to pascal case
 * @param value - The string to convert to pascal case
 * @returns
 */
export function toPascalCase(value: string) {
  return `${value}`
    .toLowerCase()
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(new RegExp(/\s+(.)(\w*)/, 'g'), ($1, $2, $3) => `${$2.toUpperCase() + $3}`)
    .replace(new RegExp(/\w/), s => s.toUpperCase());
}

/**
 * Converts a camel case string to kebab case
 * @param value - The camel case string to convert
 * @returns The kebab case string
 */
export function toKebabCase(value: string): string {
  return value
    .replace(/([A-Za-z])([A-Z])/g, '$1-$2')
    .replace(/\s/g, '-')
    .toLowerCase();
}

/**
 * Gets the CSS value from a string or CSSResult
 * @param value - the CSS content
 * @returns CSS string
 */
export function getCssValue(value: any) {
  return typeof value === 'object' || typeof value === 'object' ? value.cssText || value.toString() : value;
}

/**
 * Merges the content of two objects
 * @param target object being merged into
 * @param sources data to merge into the target
 * @returns object
 */
export function mergeDeep(target: any, source: any) {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  for (const key in source) {
    if (isObject(source[key])) {
      Object.assign(target, { [key]: mergeDeep(target[key], source[key]) });
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }

  return target;
}

/**
 * Checks if a value is an object
 * @param item - The value to check
 * @returns boolean
 */
function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}
