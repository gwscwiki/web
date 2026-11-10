/**
 * Authors write locale-free root paths (`/fow/duties/griffs/`). This prefixes `base` and the page's
 * locale (`/en/` for files under src/content/docs/en/), so links survive any repo name or domain.
 * (Information architecture, link convention.)
 */
import { visit } from 'unist-util-visit';

export default function rehypeLocaleLinks({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');
  return (tree, file) => {
    const path = (file.path ?? '').replace(/\\/g, '/');
    if (!path.includes('/src/content/docs/')) return;
    const en = path.includes('/src/content/docs/en/');
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return;
      if (prefix && (href === prefix || href.startsWith(`${prefix}/`))) return; // already absolute with base
      const localized = en && !href.startsWith('/en/') ? `/en${href}` : href;
      node.properties.href = `${prefix}${localized}`;
    });
  };
}
