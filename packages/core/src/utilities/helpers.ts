/**
 * @description A method to filter out any whitespace-only nodes.
 *
 * @param value node under evaluation of its contents.
 * @param _index position of the node in the array of nodes mirrored.
 * @param _array list of nodes.
 */
const whitespaceFilter = (value: Node, _index: number, _array: Node[]) => {
  return value.nodeType !== Node.TEXT_NODE
    ? true
    : typeof value.nodeValue === 'string' && !!value.nodeValue.trim().length;
};

/**
 * @description Determine if the only visible slotted content is an icon.
 *
 * @param nodes represent the nodes mirrored in the slots of a component.
 */
export const isIconOnly = (nodes: Node[], prefix: string): boolean => {
  const visibleElements = nodes
    .filter(whitespaceFilter)
    .filter(
      element =>
        !(element instanceof HTMLElement) ||
        (element instanceof HTMLElement && !element.classList.contains(`${prefix}-visually-hidden`) && !element.hidden)
    );

  const nonIconElements = visibleElements.filter(element => !(element instanceof SVGElement));

  // if there is 0 or 1 total visible elements and no non-icon elements, element is icon-only
  return visibleElements.length < 2 && nonIconElements.length === 0;
};

export function minifyCssString(css: string) {
  return css
    .replace(/*JSBlockComments*/ /\/\*[\S\s]*?\*\//gm, '')
    .replace(/\n/g, '')
    .replace(/\s\s/g, '')
    .trim();
}

/**
 *
 * A utility function that returns a promise that resolves after a specified number of milliseconds.
 * @param ms milliseconds to wait before resolving the promise.
 * @returns A promise that resolves after the specified time.
 */
export function asyncTimeout(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
