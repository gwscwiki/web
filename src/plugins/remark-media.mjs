/**
 * Media conventions for Markdown images:
 * - `@media/x.webp` is shared; on a French page `x.fr.webp` (English: `x.en.webp`) overrides it if present.
 * - Empty alt text fails the build.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { visit } from 'unist-util-visit';

const MEDIA_DIR = 'src/assets/media';

export default function remarkMedia() {
  return (tree, file) => {
    const path = (file.path ?? '').replace(/\\/g, '/');
    if (!path.includes('/src/content/docs/')) return;
    const locale = path.includes('/src/content/docs/en/') ? 'en' : 'fr';
    visit(tree, 'image', (node) => {
      if (!node.alt?.trim()) throw new Error(`${path}: image "${node.url}" has empty alt text`);
      if (!node.url.startsWith('@media/')) return;
      const rel = node.url.slice('@media/'.length);
      const override = rel.replace(/(\.\w+)$/, `.${locale}$1`);
      if (existsSync(join(process.cwd(), MEDIA_DIR, override))) node.url = `@media/${override}`;
    });
  };
}
