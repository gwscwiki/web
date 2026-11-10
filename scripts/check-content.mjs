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

// 3. `kind` matches the path (Information architecture).
const expectedKind = (id) => {
  const p = id.split('/');
  if (p[0] === 'builds') return p.length === 2 ? 'core' : p.length === 3 ? 'build' : undefined;
  if (p[0] === 'gear') return p.length === 3 ? 'gear' : undefined;
  if (p[0] === 'consumables') return p.length === 3 ? 'consumable' : undefined;
  if (p[1] === 'roles' && p.length === 3) return 'role';
  if (p[1] === 'duties' && p.length === 3) return 'duty';
  if (p.length === 1 && !['index', 'about', 'builds', 'gear', 'consumables'].includes(p[0])) return 'zone';
  return undefined;
};
const GEAR_TYPES = ['weapons', 'weapon-sets', 'runes', 'insignias'];
const CONSUMABLE_KINDS = ['cons', 'summoning-stones', 'powerstones', 'sweets-alcohol', 'other'];
for (const [id, { file, fm }] of fr) {
  const want = expectedKind(id);
  if ((fm.kind ?? undefined) !== want) err(file, `kind is "${fm.kind ?? '(none)'}" but the path says "${want ?? '(plain page)'}"`);
  const folder = id.split('/')[1];
  if (fm.kind === 'gear' && !GEAR_TYPES.includes(folder)) err(file, `unknown gear folder "${folder}"`);
  if (fm.kind === 'consumable' && !CONSUMABLE_KINDS.includes(folder)) err(file, `unknown consumable folder "${folder}"`);
  if (fm.kind === 'gear' && 'gearType' in fm) err(file, 'gearType comes from the folder; remove it');
}

// 4. Every Role and Duty sits in exactly one Zone; Zone lists point at the right kinds.
const zones = [...fr].filter(([, e]) => e.fm.kind === 'zone');
for (const [id, { file, fm }] of fr) {
  if (fm.kind !== 'role' && fm.kind !== 'duty') continue;
  const key = fm.kind === 'role' ? 'roles' : 'duties';
  const n = zones.filter(([, z]) => (z.fm[key] ?? []).includes(id)).length;
  if (n !== 1) err(file, `listed by ${n} Zones (must be exactly 1)`);
}

// 5. skillNotes reference skills that are in the Build's code; codes decode.
for (const [, { file, fm }] of fr) {
  if (fm.kind !== 'build' && fm.kind !== 'core') continue;
  let skills;
  try { skills = SkillTemplate.fromTemplate(fm.code).skills; } catch (e) { err(file, `template code does not decode: ${e.message}`); continue; }
  for (const n of fm.skillNotes ?? []) if (!skills.includes(n.skill)) err(file, `skillNotes: skill ${n.skill} is not in the code`);
}

// 6. Party setups: exactly one default per Zone.
const setups = walk('src/content/party-setups').filter((f) => f.endsWith('.yaml')).map((f) => ({ f, ...parse(readFileSync(f, 'utf8')) }));
for (const [id, { file }] of zones) {
  const n = setups.filter((s) => s.zone === id && s.default).length;
  if (n !== 1) err(file, `${n} default Party setups (must be exactly 1)`);
}

// 7. Skill nicknames: every ID is used somewhere in content.
const allText = [...files, ...walk('src/content/party-setups')].map((f) => readFileSync(f, 'utf8')).join('\n');
const usedSkills = new Set();
for (const m of allText.matchAll(/(?:code:\s*|code=")([A-Za-z0-9+/]{10,})/g)) {
  try { SkillTemplate.fromTemplate(m[1]).skills.forEach((s) => usedSkills.add(s)); } catch {}
}
for (const m of allText.matchAll(/skill:\s*(\d+)/g)) usedSkills.add(Number(m[1]));
for (const n of parse(readFileSync('src/content/skill-nicknames.yaml', 'utf8')) ?? [])
  if (!usedSkills.has(n.skill)) err('src/content/skill-nicknames.yaml', `nickname "${n.nickname}" for unused skill ${n.skill}`);

// 8. Block syntax (Storage mapping): self-closing, one per line, string attributes, no imports, no wrappers.
const BLOCKS = 'SkillBar|BuildBar|GearCard|DutyBadge|Loop|YouTube|GearIndex|ConsumableIndex|BuildIndex';
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
