/**
 * Sidebar built at config time (Information architecture): one group per Zone with its Strategies
 * (default first, then larger teams), Roles and Duties; Roles and Duties follow the order in the French
 * Zone frontmatter (run order has one source). Builds grouped by core. Gear and Consumables have no pages.
 *
 * Labels are compacted for the sidebar, and the details that matter for scanning are passed as data-*
 * attributes that base.css renders (§ Sidebar): a Strategy shows its team size and run time instead of
 * repeating "à N" in its label; a Build drops the prefix its whole core shares ("VoS …") and shows its
 * trailing "(Strategy)" as a tag; groups show how many entries they hold.
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
const group = (label, en, items, collapsed = false, count) => ({
  label,
  translations: en ? { en } : undefined,
  items,
  collapsed,
  badge: count ? { text: String(count), class: 'gw-count' } : undefined,
});
/** Run time in minutes from "~12 min" (strategies without one sort last among their team size). */
const minutes = (fm) => Number(String(fm.time ?? '').match(/\d+/)?.[0] ?? Infinity);
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Roll-way à 7" / "7-man roll-way" → "Roll-way"; titles that don't follow the pattern are kept. */
function strategyLabel(t) {
  const short = t.replace(/\s+à\s+\d+(?!\d)/, '').replace(/^\d+-man\s+(?=\p{L})/u, '');
  return capitalize(short);
}

/** Splits "VoS D/A (TUF-way)" into its base and trailing "(…)" tag. */
const splitTag = (t) => {
  const m = t.match(/^(.*?)\s*\(([^()]+)\)$/);
  return m ? { base: m[1], tag: m[2] } : { base: t, tag: undefined };
};
/** Words every base starts with (only for groups of two builds or more). */
function sharedPrefix(bases) {
  if (bases.length < 2) return [];
  const words = bases.map((b) => b.split(/\s+/));
  const prefix = [];
  for (let i = 0; words.every((w) => w.length > i && w[i] === words[0][i]); i++) prefix.push(words[0][i]);
  return prefix;
}
/** Labels for one core's builds in one locale: shared prefix removed (unless nothing would remain). */
function buildLabels(titles) {
  const bases = titles.map((t) => splitTag(t).base);
  const n = sharedPrefix(bases).length;
  return bases.map((b) => {
    const rest = b.split(/\s+/).slice(n).join(' ');
    return capitalize(rest || b);
  });
}

export function buildSidebar() {
  const zones = ZONES.map((z) => {
    const fm = frontmatter(join(DOCS, z, 'index.mdx'));
    if (fm.kind !== 'zone') throw new Error(`sidebar: ${z}/index.mdx is not a Zone`);
    const dir = join(DOCS, z, 'strategies');
    const strategies = (existsSync(dir) ? readdirSync(dir) : [])
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => ({ slug: `${z}/strategies/${f.replace(/\.mdx$/, '')}`, fm: frontmatter(join(dir, f)) }))
      .sort((a, b) => Number(!!b.fm.default) - Number(!!a.fm.default) || b.fm.roles.length - a.fm.roles.length || minutes(a.fm) - minutes(b.fm) || a.fm.label.localeCompare(b.fm.label))
      .map(({ slug, fm }) => {
        const en = enTitle(slug);
        return {
          slug,
          label: strategyLabel(fm.title),
          translations: en ? { en: strategyLabel(en) } : undefined,
          attrs: { class: 'gw-nav-strategy', 'data-team': String(fm.roles.length), 'data-time': fm.time?.replace(/^~\s*/, '') },
        };
      });
    return group(title(z), enTitle(z), [
      { slug: z, label: "Vue d'ensemble", translations: { en: 'Overview' } },
      group('Stratégies', 'Strategies', strategies, false, strategies.length),
      group('Rôles', 'Roles', fm.roles.map((slug) => ({ slug })), true, fm.roles.length),
      group('Duties', 'Duties', fm.duties.map((slug) => ({ slug })), true, fm.duties.length),
    ]);
  });
  const cores = readdirSync(join(DOCS, 'builds'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(DOCS, 'builds', d.name, 'index.mdx')))
    .map((d) => {
      const dir = `builds/${d.name}`;
      const slugs = readdirSync(join(DOCS, dir))
        .filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')
        .map((f) => `${dir}/${f.replace(/\.mdx$/, '')}`);
      const fr = slugs.map(title);
      const fallbackEn = slugs.map((slug, i) => enTitle(slug) ?? fr[i]);
      const frLabels = buildLabels(fr);
      const enLabels = buildLabels(fallbackEn);
      const builds = slugs.map((slug, i) => ({
        slug,
        label: frLabels[i],
        translations: { en: enLabels[i] },
        attrs: { class: 'gw-nav-build', 'data-tag': splitTag(fr[i]).tag },
      }));
      const items = [{ slug: dir, label: 'Core', translations: { en: 'Core' }, attrs: { class: 'gw-nav-core' } }, ...builds];
      return group(title(dir), enTitle(dir), items, true, builds.length);
    });
  return [
    { link: '/', label: 'Accueil', translations: { en: 'Home' } },
    ...zones,
    group('Builds', 'Builds', [{ slug: 'builds', label: 'Tous les builds', translations: { en: 'All builds' } }, ...cores]),
    { slug: 'about' },
  ];
}
