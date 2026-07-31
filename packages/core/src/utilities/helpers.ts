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

/**
 * Finds the index of the next item in a wrap-around list starting from `startIndex` that
 * satisfies `isEnabled`, walking in the given direction. Returns `-1` when no item qualifies
 * (e.g. every item is disabled) or the list is empty. Used by roving-tabindex widgets
 * (tabs, button-group) to skip disabled items during arrow/Home/End navigation.
 *
 * @param items the list to search.
 * @param startIndex index to search from (not included in the first step).
 * @param direction `1` to walk forward, `-1` to walk backward.
 * @param isEnabled predicate deciding whether an item may be focused.
 * @returns the index of the next enabled item, or `-1`.
 */
export function findNextEnabledIndex<T>(
  items: readonly T[],
  startIndex: number,
  direction: 1 | -1,
  isEnabled: (item: T) => boolean
): number {
  const count = items.length;
  if (!count) return -1;
  for (let i = 0; i < count; i++) {
    const idx = (((startIndex + direction * (i + 1)) % count) + count) % count;
    if (isEnabled(items[idx])) return idx;
  }
  return -1;
}
