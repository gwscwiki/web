#!/usr/bin/env node
/**
 * Content checks that the schema can't express (Storage mapping, Media conventions, Information architecture).
 * Run in CI before `astro build`: `node scripts/check-content.mjs`. Exits 1 on any error.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';
import sharp from 'sharp';
import { SkillTemplate } from '@buildwars/gw-templates';

const DOCS = 'src/content/docs';
const MEDIA = 'src/assets/media';
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name).replace(/\\/g, '/')],
  );
const split = (file) => {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { fm: parse(m[1]) ?? {}, body: m[2] } : { fm: {}, body: text };
};
/** docs id the way Starlight computes it: path without extension, `/index` dropped. */
const idOf = (file) => relative(DOCS, file).replace(/\\/g, '/').replace(/\.mdx?$/, '').replace(/\/index$/, '');

const files = walk(DOCS).filter((f) => /\.mdx?$/.test(f));
const fr = new Map();
const en = new Map();
for (const f of files) {
  const id = idOf(f);
  if (id === 'en' || id.startsWith('en/')) en.set(id === 'en' ? 'index' : id.slice(3), f);
  else fr.set(id, { file: f, ...split(f) });
}

// 1. French-first: every English page has a French twin (ADR 0001 relies on it).
for (const [id, f] of en) if (!fr.has(id)) err(f, `English page without a French twin (${id})`);

// 2. English twins hold only title/description/body; shared fields belong to the French file.
const EN_ALLOWED = new Set(['title', 'description', 'sidebar', 'template', 'hero', 'tableOfContents', 'pagefind', 'draft', 'banner', 'head', 'lastUpdated', 'prev', 'next', 'editUrl']);
for (const [, f] of en) for (const k of Object.keys(split(f).fm)) if (!EN_ALLOWED.has(k)) err(f, `shared field "${k}" belongs in the French file only`);

// 3. `kind` matches the path (Information architecture). Gear and Consumables have no pages (ADR 0003).
const expectedKind = (id) => {
  const p = id.split('/');
  if (p[0] === 'builds') return p.length === 2 ? 'core' : p.length === 3 ? 'build' : undefined;
  if (p[1] === 'strategies' && p.length === 3) return 'strategy';
  if (p[1] === 'duties' && p.length === 3) return 'duty';
  if (p.length === 1 && !['index', 'about', 'builds'].includes(p[0])) return 'zone';
  return undefined;
};
for (const [id, { file, fm }] of fr) {
  const want = expectedKind(id);
  if ((fm.kind ?? undefined) !== want) err(file, `kind is "${fm.kind ?? '(none)'}" but the path says "${want ?? '(plain page)'}"`);
}

// 4. Every Duty sits in exactly one Zone and in one of that Zone's Regions; Region ids are unique.
const zones = [...fr].filter(([, e]) => e.fm.kind === 'zone');
for (const [, { file, fm }] of zones) {
  const ids = (fm.regions ?? []).map((r) => r.id);
  if (new Set(ids).size !== ids.length) err(file, 'region ids must be unique');
}
for (const [id, { file, fm }] of fr) {
  if (fm.kind !== 'duty') continue;
  const owners = zones.filter(([, z]) => (z.fm.duties ?? []).includes(id));
  if (owners.length !== 1) err(file, `listed by ${owners.length} Zones (must be exactly 1)`);
  else if (!(owners[0][1].fm.regions ?? []).some((r) => r.id === fm.region)) err(file, `region "${fm.region}" is not a Region of its Zone`);
}

// 5. skillNotes reference skills that are in the Build's code; codes decode.
for (const [, { file, fm }] of fr) {
  if (fm.kind !== 'build' && fm.kind !== 'core') continue;
  let skills;
  try { skills = SkillTemplate.fromTemplate(fm.code).skills; } catch (e) { err(file, `template code does not decode: ${e.message}`); continue; }
  for (const n of fm.skillNotes ?? []) if (!skills.includes(n.skill)) err(file, `skillNotes: skill ${n.skill} is not in the code`);
}

// 6. Strategies: exactly one default per Zone; Role names unique within it; Duties from its own Zone; Builds exist.
const strategies = [...fr].filter(([, e]) => e.fm.kind === 'strategy');
const kindOf = (id) => fr.get(id)?.fm.kind;
for (const [id, { file }] of zones) {
  const n = strategies.filter(([sid, s]) => sid.split('/')[0] === id && s.fm.default).length;
  if (n !== 1) err(file, `${n} default Strategies (must be exactly 1)`);
}
for (const [id, { file, fm }] of strategies) {
  const zone = fr.get(id.split('/')[0])?.fm;
  const seen = new Set();
  for (const r of fm.roles ?? []) {
    if (seen.has(r.role)) err(file, `role ${r.role} listed twice`);
    seen.add(r.role);
    if (r.build && kindOf(r.build) !== 'build') err(file, `${r.role}: build ${r.build} is not a Build`);
    for (const d of r.duties ?? []) if (!(zone?.duties ?? []).includes(d)) err(file, `${r.role}: duty ${d} is not a Duty of its Zone`);
  }
}

// 6b. Data without pages (ADR 0003): Gear (type = folder), Gear sets (shape = folder),
//     Consumables (kind = folder). Every reference points at something that exists.
const yamlUnder = (dir) => (existsSync(dir) ? walk(dir).filter((f) => /\.ya?ml$/.test(f)) : []);
const dataId = (dir, f) => relative(dir, f).replace(/\\/g, '/').replace(/\.ya?ml$/, '');
const loadData = (dir) => new Map(yamlUnder(dir).map((f) => [dataId(dir, f), { f, d: parse(readFileSync(f, 'utf8')) ?? {} }]));
const gear = loadData('src/content/gear');
const sets = loadData('src/content/gear-sets');
const consumables = loadData('src/content/consumables');
for (const [id, { f, d }] of gear) {
  if (!['weapons', 'runes', 'insignias'].includes(id.split('/')[0]) || id.split('/').length !== 2) err(f, `gear goes in weapons/, runes/ or insignias/ (got "${id}")`);
  if (d.modId == null && d.base == null && !d.name) err(f, 'needs modId, base or name');
}
for (const [id, { f, d }] of sets) {
  const type = id.split('/')[0];
  if (type === 'armor') {
    if (!d.pieces || d.weapons) err(f, 'an armor set has `pieces` and no `weapons`');
    for (const [slot, piece] of Object.entries(d.pieces ?? {}))
      for (const k of ['insignia', 'rune']) if (piece?.[k] && !gear.has(piece[k])) err(f, `${slot}.${k}: no gear "${piece[k]}"`);
  } else if (type === 'weapons') {
    if (!d.weapons?.length || d.pieces) err(f, 'a weapon set has `weapons` and no `pieces`');
    for (const w of d.weapons ?? []) if (!gear.has(w)) err(f, `no gear "${w}"`);
  } else err(f, `gear sets go in armor/ or weapons/ (got "${id}")`);
}
const CONSUMABLE_KINDS = ['cons', 'summoning-stones', 'powerstones', 'sweets-alcohol', 'other'];
for (const [id, { f, d }] of consumables) {
  if (!CONSUMABLE_KINDS.includes(id.split('/')[0])) err(f, `unknown consumable folder in "${id}"`);
  for (const r of d.requirements ?? []) {
    const t = r.target ?? {};
    if (t.type === 'role') {
      // A Role only exists within its Strategy.
      const s = fr.get(t.strategy)?.fm;
      if (s?.kind !== 'strategy') err(f, `requirement target role: strategy "${t.strategy}" not found`);
      else if (!(s.roles ?? []).some((x) => x.role === t.role)) err(f, `requirement target role: no role "${t.role}" in ${t.strategy}`);
    } else if (kindOf(t[t.type]) !== t.type) err(f, `requirement target ${t.type} "${t[t.type]}" not found`);
  }
}
for (const [, { file, fm }] of fr) {
  if (fm.kind !== 'core' && fm.kind !== 'build') continue;
  const l = fm.loadout ?? {};
  if (l.armor && !l.armor.startsWith('armor/')) err(file, `loadout.armor must be an armor set (got "${l.armor}")`);
  for (const w of l.weapons ?? []) if (!w.startsWith('weapons/')) err(file, `loadout.weapons must be weapon sets (got "${w}")`);
  for (const id of [l.armor, ...(l.weapons ?? [])].filter(Boolean)) if (!sets.has(id)) err(file, `loadout: no gear set "${id}"`);
  for (const g of fm.gear ?? []) {
    if (!sets.has(g.set)) err(file, `gear: no gear set "${g.set}"`);
    for (const d of g.duties ?? []) if (kindOf(d) !== 'duty') err(file, `gear ${g.set}: "${d}" is not a Duty`);
  }
}

// 7. Skill nicknames: every ID is used somewhere in content.
const allText = files.map((f) => readFileSync(f, 'utf8')).join('\n');
const usedSkills = new Set();
for (const m of allText.matchAll(/(?:code:\s*|code=")([A-Za-z0-9+/]{10,})/g)) {
  try { SkillTemplate.fromTemplate(m[1]).skills.forEach((s) => usedSkills.add(s)); } catch {}
}
for (const m of allText.matchAll(/skill:\s*(\d+)/g)) usedSkills.add(Number(m[1]));
for (const n of parse(readFileSync('src/content/skill-nicknames.yaml', 'utf8')) ?? [])
  if (!usedSkills.has(n.skill)) err('src/content/skill-nicknames.yaml', `nickname "${n.nickname}" for unused skill ${n.skill}`);

// 8. Block syntax (Storage mapping): self-closing, one per line, string attributes, no imports, no wrappers.
const BLOCKS = 'SkillBar|BuildBar|GearCard|DutyBadge|Loop|YouTube|BuildIndex';
const ALLOW_IMPORTS = new Set(['index']); // home page uses Starlight's hero and card grid
for (const f of files) {
  const { body } = split(f);
  const id = idOf(f).replace(/^en\/?/, '') || 'index';
  if (!ALLOW_IMPORTS.has(id) && /^\s*(import|export)\s/m.test(body)) err(f, 'no import/export lines in content (blocks are auto-imported)');
  for (const m of body.matchAll(new RegExp(`<(${BLOCKS})\\b[^>]*>`, 'g'))) {
    if (!m[0].endsWith('/>')) err(f, `<${m[1]}> must be self-closing`);
    if (/=\{/.test(m[0])) err(f, `<${m[1]}> attributes must be plain strings`);
  }
  for (const line of body.split('\n')) if ((line.match(new RegExp(`<(${BLOCKS})\\b`, 'g')) ?? []).length > 1) err(f, `one block per line: ${line.trim()}`);
}

// 8b. Inline refs `[…](kind:id)` (src/plugins/remark-refs.mjs) point at real catalog entries.
// Skill IDs are checked at build time against game data.
const yamlIds = (dir) => new Set(walk(dir).filter((f) => f.endsWith('.yaml')).map((f) => relative(dir, f).replace(/\\/g, '/').replace(/\.yaml$/, '')));
const catalog = { cons: yamlIds('src/content/consumables'), gear: yamlIds('src/content/gear'), set: yamlIds('src/content/gear-sets') };
for (const f of files)
  for (const m of split(f).body.matchAll(/\]\((skill|cons|gear|set):([^)\s]+)\)/g)) {
    if (m[1] === 'skill') { if (!/^\d+$/.test(m[2])) err(f, `skill ref "${m[2]}" must be a game ID`); }
    else if (!catalog[m[1]].has(m[2])) err(f, `no ${m[1]} "${m[2]}" for ref`);
  }

// 9. Media: caps, empty alt, unreferenced files (Media conventions).
const media = existsSync(MEDIA) ? walk(MEDIA) : [];
const contentText = allText + walk('src/content').filter((f) => f.endsWith('.yaml')).map((f) => readFileSync(f, 'utf8')).join('\n');
for (const f of files) for (const m of split(f).body.matchAll(/!\[\s*\]\(/g)) err(f, 'image with empty alt text');
for (const f of media) {
  const rel = relative(MEDIA, f).replace(/\\/g, '/');
  const size = statSync(f).size;
  if (/\.(webm|mp4)$/.test(f) && size > 2 * 1024 * 1024) err(f, `loop over 2 MB (${(size / 1048576).toFixed(1)} MB)`);
  if (/\.(png|webp|jpe?g)$/.test(f)) {
    if (size > 1024 * 1024) err(f, `image over 1 MB`);
    const { width } = await sharp(f).metadata();
    if (width > 1920) err(f, `image wider than 1920 px (${width})`);
  }
  // referenced as `@media/<rel>`, as a locale override of a referenced file, or as a Loop stem
  const shared = rel.replace(/\.(fr|en)(\.\w+)$/, '$2');
  const stem = rel.replace(/(\.poster)?\.\w+$/, '');
  if (!contentText.includes(`@media/${rel}`) && !contentText.includes(`@media/${shared}`) && !contentText.includes(`src="${stem}"`))
    err(f, 'media file not referenced by any content');
}

if (errors.length) {
  console.error(`✗ ${errors.length} content problem(s):\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ content checks passed (${fr.size} French pages, ${en.size} English, ${media.length} media files)`);
