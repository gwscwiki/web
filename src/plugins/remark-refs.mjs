/**
 * Inline game references in prose, written as plain Markdown links so the CMS editor keeps them:
 *
 *   [Vow of Strength](skill:1759)                          skill, by game ID
 *   [Legionnaire](cons:summoning-stones/legionnaire-summoning-crystal)   Consumable
 *   [Shield](gear:weapons/shield-devotion-slashing)        Gear item
 *   [Slashing shield](set:weapons/shield-slashing)         Gear set
 *
 * Each becomes an inline <Ref> chip (auto-imported) that shows the in-game name in the reader's
 * language: the link text is only for authors and the CMS preview.
 */
import { visit } from 'unist-util-visit';

export const REF_RE = /^(skill|cons|gear|set):(.+)$/;

export default function remarkRefs() {
  return (tree, file) => {
    const path = (file.path ?? '').replace(/\\/g, '/');
    if (!path.includes('/src/content/docs/') || !path.endsWith('.mdx')) return;
    visit(tree, 'link', (node, index, parent) => {
      const m = node.url.match(REF_RE);
      if (!m || !parent || index == null) return;
      parent.children[index] = {
        type: 'mdxJsxTextElement',
        name: 'Ref',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'kind', value: m[1] },
          { type: 'mdxJsxAttribute', name: 'id', value: m[2] },
        ],
        children: [],
      };
    });
  };
}
