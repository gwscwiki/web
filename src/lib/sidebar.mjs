/**
 * Sidebar built at config time (Information architecture): one group per Zone whose Roles and Duties
 * follow the order in the French Zone frontmatter (run order has one source). Builds grouped by core.
 * Gear and Consumables appear only as links to their index pages.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const DOCS = 'src/content/docs';
/** Zone order in the sidebar (hand-set). */
export const ZONES = ['fow'];

function frontmatter(file) {
  const m = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? parse(m[1]) : {};
}
const title = (id) => {
  const file = [join(DOCS, `${id}.mdx`), join(DOCS, id, 'index.mdx')].find(existsSync);
  return file ? frontmatter(file).title : id;
};
const enTitle = (id) => {
  const file = [join(DOCS, 'en', `${id}.mdx`), join(DOCS, 'en', id, 'index.mdx')].find(existsSync);
  return file ? frontmatter(file).title : undefined;
};
const group = (label, en, items, collapsed = false) => ({ label, translations: en ? { en } : undefined, items, collapsed });

export function buildSidebar() {
  const zones = ZONES.map((z) => {
    const fm = frontmatter(join(DOCS, z, 'index.mdx'));
    if (fm.kind !== 'zone') throw new Error(`sidebar: ${z}/index.mdx is not a Zone`);
    return group(title(z), enTitle(z), [
      { slug: z, label: "Vue d'ensemble", translations: { en: 'Overview' } },
      group('Rôles', 'Roles', fm.roles.map((slug) => ({ slug }))),
      group('Duties', 'Duties', fm.duties.map((slug) => ({ slug }))),
    ]);
  });
  const cores = readdirSync(join(DOCS, 'builds'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(DOCS, 'builds', d.name, 'index.mdx')))
    .map((d) => {
      const dir = `builds/${d.name}`;
      const builds = readdirSync(join(DOCS, dir))
        .filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')
        .map((f) => ({ slug: `${dir}/${f.replace(/\.mdx$/, '')}` }));
      return group(title(dir), enTitle(dir), [{ slug: dir, label: 'Core', translations: { en: 'Core' } }, ...builds], true);
    });
  return [
    { link: '/', label: 'Accueil', translations: { en: 'Home' } },
    ...zones,
    group('Builds', 'Builds', [{ slug: 'builds', label: 'Tous les builds', translations: { en: 'All builds' } }, ...cores]),
    { slug: 'gear' },
    { slug: 'consumables' },
    { slug: 'about' },
  ];
}
