/**
 * Like `Node.contains()`, but crosses shadow boundaries: walks `parentNode` and steps from a `ShadowRoot` to its host
 * only at the root boundary, so every same-root ancestor is checked.
 */
export function composedContains(container: Node, node: Node | null): boolean {
  while (node) {
    if (node === container) return true;
    node = node instanceof ShadowRoot ? node.host : node.parentNode;
  }
  return false;
}
