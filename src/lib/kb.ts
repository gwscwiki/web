/**
 * Knowledge-base queries. Shared data lives only in the French entry (ADR 0001):
 * always read entities through `getShared`, never an English entry's own frontmatter.
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Lang } from './gw/names';
import { decodeBar, deriveFromCore, type Bar } from './gw/templates';

export type Doc = CollectionEntry<'docs'>;
type Data = Doc['data'];
export type Kind = NonNullable<Data['kind']>;
export type Entity<K extends Kind = Kind> = Omit<Doc, 'data'> & { data: Extract<Data, { kind: K }> };
export type Requirement = Extract<Data, { kind: 'gear' }>['requirements'][number];
export type Loadout = Extract<Data, { kind: 'core' }>['loadout'];

/** `en/fow/roles/v1` → `fow/roles/v1`; ids of index pages have no `/index`. */
export const baseId = (id: string) => (id === 'en' ? 'index' : id.startsWith('en/') ? id.slice(3) : id);
export const langOf = (id: string): Lang => (id === 'en' || id.startsWith('en/') ? 'en' : 'fr');
const refId = (r: string | { id: string }) => (typeof r === 'string' ? r : r.id);

let cache: Promise<{ fr: Map<string, Doc>; en: Map<string, Doc> }> | undefined;
function allDocs() {
  // Content is static per build; in dev, re-read so edits show up.
  if (cache && !import.meta.env.DEV) return cache;
  cache = (async () => {
    const docs = await getCollection('docs');
    const fr = new Map<string, Doc>();
    const en = new Map<string, Doc>();
    for (const d of docs) (langOf(d.id) === 'en' ? en : fr).set(baseId(d.id), d);
    return { fr, en };
  })();
  return cache;
}

/** The French entry, which holds the shared fields. */
export async function getShared(id: string): Promise<Doc | undefined> {
  return (await allDocs()).fr.get(baseId(id));
}

export async function entity<K extends Kind>(id: string | { id: string }, kind?: K): Promise<Entity<K> | undefined> {
  const d = await getShared(refId(id));
  if (!d?.data.kind || (kind && d.data.kind !== kind)) return undefined;
  return d as unknown as Entity<K>;
}

export async function entities<K extends Kind>(kind: K): Promise<Entity<K>[]> {
  return [...(await allDocs()).fr.values()].filter((d) => d.data.kind === kind) as unknown as Entity<K>[];
}

/** Title in the reader's language; falls back to French. */
export async function titleOf(id: string | { id: string }, lang: Lang): Promise<string> {
  const { fr, en } = await allDocs();
  const b = baseId(refId(id));
  return (lang === 'en' ? en.get(b) : undefined)?.data.title ?? fr.get(b)?.data.title ?? b;
}

export function urlOf(id: string | { id: string }, lang: Lang): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const b = baseId(refId(id));
  const path = b === 'index' ? '' : `${b}/`;
  return `${base}/${lang === 'en' ? 'en/' : ''}${path}`;
}

export function tr(s: { fr: string; en?: string } | undefined, lang: Lang): { text: string; untranslated: boolean } | undefined {
  if (!s) return undefined;
  if (lang === 'en' && s.en) return { text: s.en, untranslated: false };
  return { text: s.fr, untranslated: lang === 'en' };
}

// ---------- Zones, Roles, Duties, Party setups ----------

export async function zoneOf(id: string | { id: string }): Promise<Entity<'zone'> | undefined> {
  const b = baseId(refId(id));
  return (await entities('zone')).find(
    (z) => z.data.roles.some((r) => refId(r) === b) || z.data.duties.some((d) => refId(d) === b),
  );
}

export async function setupsOf(zoneId: string) {
  const setups = await getCollection('partySetups');
  return setups
    .filter((s) => refId(s.data.zone) === baseId(zoneId))
    .sort((a, b) => Number(b.data.default) - Number(a.data.default));
}

export async function defaultSetup(zoneId: string) {
  return (await setupsOf(zoneId)).find((s) => s.data.default);
}

/** Duties a Role carries in each Party setup, default first. */
export async function dutiesByRole(roleId: string) {
  const zone = await zoneOf(roleId);
  if (!zone) return [];
  return (await setupsOf(zone.id)).map((s) => ({
    setup: s,
    duties: s.data.roles.find((r) => refId(r.role) === baseId(roleId))?.duties.map(refId) ?? null,
  }));
}

/** Roles carrying a Duty in each Party setup. */
export async function rolesByDuty(dutyId: string) {
  const zone = await zoneOf(dutyId);
  if (!zone) return [];
  return (await setupsOf(zone.id)).map((s) => ({
    setup: s,
    roles: s.data.roles.filter((r) => r.duties.some((d) => refId(d) === baseId(dutyId))).map((r) => refId(r.role)),
  }));
}

// ---------- Requirements ----------

export const targetId = (r: Requirement) =>
  refId(r.target.type === 'zone' ? r.target.zone : r.target.type === 'role' ? r.target.role : r.target.duty);

export interface Need { item: Entity<'gear' | 'consumable'>; req: Requirement; via: string }

/** Gear and Consumables whose Requirements target one of `targets` (`via` = which target matched). */
export async function needsFor(targets: string[]): Promise<Need[]> {
  const set = new Set(targets.map(baseId));
  const items = [...(await entities('gear')), ...(await entities('consumable'))] as Entity<'gear' | 'consumable'>[];
  const out: Need[] = [];
  for (const item of items)
    for (const req of item.data.requirements) if (set.has(targetId(req))) out.push({ item, req, via: targetId(req) });
  const rank = { required: 0, recommended: 1, optional: 2 };
  return out.sort((a, b) => rank[a.req.level] - rank[b.req.level]);
}

// ---------- Builds, cores, Loadouts ----------

export async function barOf(e: Entity<'core' | 'build'>): Promise<Bar> {
  return decodeBar(e.data.code);
}

export async function buildsOfCore(coreId: string) {
  return (await entities('build')).filter((b) => refId(b.data.core) === baseId(coreId));
}

export async function rolesRunning(buildId: string) {
  return (await entities('role')).filter((r) => refId(r.data.build) === baseId(buildId));
}

export async function derived(build: Entity<'build'>) {
  const core = await entity(build.data.core, 'core');
  if (!core) throw new Error(`${build.id}: core ${refId(build.data.core)} not found`);
  return { core, coreBar: decodeBar(core.data.code), bar: decodeBar(build.data.code), ...deriveFromCore(decodeBar(core.data.code), decodeBar(build.data.code)) };
}

/** A Build's Loadout merged over its core's: armor per slot and field, weapon sets by id (Storage mapping). */
export async function mergedLoadout(e: Entity<'core' | 'build'>): Promise<Loadout> {
  if (e.data.kind === 'core') return e.data.loadout;
  const core = await entity(e.data.core, 'core');
  const base = core?.data.loadout ?? {};
  const own = e.data.loadout;
  const sets = [...(base.weaponSets ?? [])];
  for (const s of own.weaponSets ?? []) {
    const i = sets.findIndex((x) => x.id === s.id);
    if (i >= 0) sets[i] = s;
    else sets.push(s);
  }
  const armor: NonNullable<Loadout['armor']> = { ...(base.armor ?? {}) };
  for (const [slot, piece] of Object.entries(own.armor ?? {}) as [keyof typeof armor, any][])
    armor[slot] = { ...(armor[slot] ?? {}), ...piece };
  return { weaponSets: sets, armor };
}

export function loadoutGear(l: Loadout): string[] {
  const ids = (l.weaponSets ?? []).flatMap((s) => s.weapons.map(refId));
  for (const p of Object.values(l.armor ?? {})) {
    if (p?.insignia) ids.push(refId(p.insignia));
    if (p?.rune) ids.push(refId(p.rune));
  }
  return ids;
}

/** Cores and Builds whose (merged) Loadout includes this Gear. */
export async function wornBy(gearId: string) {
  const b = baseId(gearId);
  const holders = [...(await entities('core')), ...(await entities('build'))] as Entity<'core' | 'build'>[];
  const out: Entity<'core' | 'build'>[] = [];
  for (const h of holders) if (loadoutGear(await mergedLoadout(h)).includes(b)) out.push(h);
  return out;
}

// ---------- Gear and Consumables ----------

/** Gear type / Consumable kind come from the folder (Information architecture). */
export const gearType = (id: string) => baseId(id).split('/')[1] as 'weapons' | 'weapon-sets' | 'runes' | 'insignias';
export const consumableKind = (id: string) => baseId(id).split('/')[1];

/** The in-game name in the reader's language, from game data where there is one. */
export async function gameName(e: Entity<'gear' | 'consumable'>, lang: Lang): Promise<string> {
  if (e.data.kind === 'consumable') return lang === 'fr' ? e.data.nameFr : e.data.gwwTitle;
  if (e.data.modId != null) return (await getEntry('mods', String(e.data.modId)))?.data.name[lang] ?? e.data.title;
  if (e.data.base != null) {
    const base = (await getEntry('items', String(e.data.base)))?.data.name[lang];
    const mods = await Promise.all(e.data.mods.map(async (m) => (await getEntry('mods', String(m)))?.data.name[lang]));
    return [base, ...mods].filter(Boolean).join(' · ');
  }
  return e.data.gwwTitle ?? e.data.title;
}
