---
'@charm-ux/core': minor
---

### Breadcrumb separators

- [Breadcrumb] The separator belongs to `<ch-breadcrumb>`. Its default is a chevron, and a custom separator placed in the `separator` slot is cloned between every item.
- [Breadcrumb] Separators are placed between items, not after the last one. Items no longer render or accept their own separator. Removed the per-item `separator` slot; move any per-item separator to the breadcrumb.
- [Breadcrumb] Separators mirror in `rtl` with CSS, so the default chevron points the right way and directional custom separators such as `›` flip too.
- [BreadcrumbItem] Removed the internal chevron and direction tracking. Items render no separator of their own.
