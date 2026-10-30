/** @deprecated Test-only helper; import from the testing subpath instead of the production utilities barrel. */
export function getMiddleOfElement(element: Element) {
  const { x, y, width, height } = element.getBoundingClientRect();

  return {
    x: Math.floor(x + width / 2),
    y: Math.floor(y + height / 2),
  };
}
