/**
 * Knowledge-base queries. Shared data lives only in the French entry (ADR 0001):
 * always read entities through `getShared`, never an English entry's own frontmatter.
 * Gear, Gear sets and Consumables are data collections without pages (ADR 0003): they link out
 * to the Guild Wars Wiki.
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Lang } from './gw/names';
import { decodeBar, deriveFromCore, type Bar } from './gw/templates';

export type Doc = CollectionEntry<'docs'>;
type Data = Doc['data'];
export type Kind = NonNullable<Data['kind']>;
export type Entity<K extends Kind = Kind> = Omit<Doc, 'data'> & { data: Extract<Data, { kind: K }> };
export type GearItem = CollectionEntry<'gear'>;
export type GearSet = CollectionEntry<'gearSets'>;
export type Consumable = CollectionEntry<'consumables'>;
export type Requirement = Consumable['data']['requirements'][number];
export type Level = Requirement['level'];
export type StrategyRole = Entity<'strategy'>['data']['roles'][number];
type Tr = { fr: string; en?: string };

/** `en/fow/roles/v1` → `fow/roles/v1`; ids of index pages have no `/index`. */
export const baseId = (id: string) => (id === 'en' ? 'index' : id.startsWith('en/') ? id.slice(3) : id);
export const langOf = (id: string): Lang => (id === 'en' || id.startsWith('en/') ? 'en' : 'fr');
export const refId = (r: string | { id: string }) => (typeof r === 'string' ? r : r.id);
const LEVEL_RANK: Record<Level, number> = { required: 0, recommended: 1, optional: 2 };
export const byLevel = <T extends { level: Level }>(a: T, b: T) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level];
const stronger = (a: Level, b: Level) => (LEVEL_RANK[a] <= LEVEL_RANK[b] ? a : b);

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

export function tr(s: Tr | undefined, lang: Lang): { text: string; untranslated: boolean } | undefined {
  if (!s) return undefined;
  if (lang === 'en' && s.en) return { text: s.en, untranslated: false };
  return { text: s.fr, untranslated: lang === 'en' };
}

// ---------- Zones, Strategies, Roles, Duties ----------

/** Strategies live in their Zone's folder: `fow/strategies/rollway` → `fow`. */
export const zoneIdOfStrategy = (id: string | { id: string }) => baseId(refId(id)).split('/')[0];

export async function zoneOf(id: string | { id: string }): Promise<Entity<'zone'> | undefined> {
  const b = baseId(refId(id));
  if (b.split('/')[1] === 'strategies') return entity(zoneIdOfStrategy(b), 'zone');
  return (await entities('zone')).find(
    (z) => z.data.roles.some((r) => refId(r) === b) || z.data.duties.some((d) => refId(d) === b),
  );
}

/** A Zone's Strategies: the default first, then larger teams first. */
export async function strategiesOf(zoneId: string) {
  const z = baseId(zoneId);
  return (await entities('strategy'))
    .filter((s) => zoneIdOfStrategy(s.id) === z)
    .sort(
      (a, b) =>
        Number(b.data.default) - Number(a.data.default) ||
        b.data.roles.length - a.data.roles.length ||
        a.data.label.localeCompare(b.data.label),
    );
}

export async function defaultStrategy(zoneId: string) {
  return (await strategiesOf(zoneId)).find((s) => s.data.default);
}

/** Run order of a Zone, to sort Duty lists. */
async function dutyOrder(zoneId: string) {
  const z = await entity(zoneId, 'zone');
  return new Map((z?.data.duties ?? []).map((d, i) => [refId(d), i]));
}

/** What a Role does in each Strategy of its Zone (null where it doesn't take part). */
export async function strategiesOfRole(roleId: string) {
  const zone = await zoneOf(roleId);
  if (!zone) return [];
  return (await strategiesOf(zone.id)).map((s) => ({
    strategy: s,
    row: s.data.roles.find((r) => refId(r.role) === baseId(roleId)) ?? null,
  }));
}

/** Roles carrying a Duty in each Strategy. */
export async function rolesByDuty(dutyId: string) {
  const zone = await zoneOf(dutyId);
  if (!zone) return [];
  return (await strategiesOf(zone.id)).map((s) => ({
    strategy: s,
    rows: s.data.roles.filter((r) => r.duties.some((d) => refId(d) === baseId(dutyId))),
  }));
}

/** Every (Strategy, Role) that runs this Build. */
export async function rolesRunning(buildId: string) {
  const out: { strategy: Entity<'strategy'>; row: StrategyRole }[] = [];
  for (const s of await entities('strategy'))
    for (const row of s.data.roles) if (row.build && refId(row.build) === baseId(buildId)) out.push({ strategy: s, row });
  return out;
}

// ---------- Builds and cores ----------

export async function barOf(e: Entity<'core' | 'build'>): Promise<Bar> {
  return decodeBar(e.data.code);
}

export async function buildsOfCore(coreId: string) {
  return (await entities('build')).filter((b) => refId(b.data.core) === baseId(coreId));
}

export async function derived(build: Entity<'build'>) {
  const core = await entity(build.data.core, 'core');
  if (!core) throw new Error(`${build.id}: core ${refId(build.data.core)} not found`);
  return { core, coreBar: decodeBar(core.data.code), bar: decodeBar(build.data.code), ...deriveFromCore(decodeBar(core.data.code), decodeBar(build.data.code)) };
}

// ---------- Gear: catalog, sets, Loadouts, Gear needs ----------

export type GearType = 'weapons' | 'runes' | 'insignias';
export type SetType = 'armor' | 'weapons';
export const ARMOR_SLOTS = ['head', 'chest', 'hands', 'legs', 'feet'] as const;
export type ArmorSlot = (typeof ARMOR_SLOTS)[number];

/** Gear type, Gear set type and Consumable kind come from the folder. */
export const gearType = (id: string | { id: string }) => refId(id).split('/')[0] as GearType;
export const setType = (id: string | { id: string }) => refId(id).split('/')[0] as SetType;
export const consumableKind = (id: string | { id: string }) => refId(id).split('/')[0];

export async function gearItem(id: string | { id: string }): Promise<GearItem> {
  const g = await getEntry('gear', refId(id));
  if (!g) throw new Error(`no Gear "${refId(id)}" in src/content/gear`);
  return g;
}

export async function gearSet(id: string | { id: string }): Promise<GearSet> {
  const s = await getEntry('gearSets', refId(id));
  if (!s) throw new Error(`no Gear set "${refId(id)}" in src/content/gear-sets`);
  return s;
}

/** The in-game name in the reader's language: `name` if set, else game data. */
export async function gearName(g: GearItem, lang: Lang): Promise<string> {
  if (g.data.name) return tr(g.data.name, lang)!.text;
  if (g.data.modId != null) return (await getEntry('mods', String(g.data.modId)))?.data.name[lang] ?? g.id;
  const base = g.data.base != null ? (await getEntry('items', String(g.data.base)))?.data.name[lang] : undefined;
  const mods = await Promise.all(g.data.mods.map(async (m) => (await getEntry('mods', String(m)))?.data.name[lang]));
  return [base, ...mods].filter(Boolean).join(' · ') || g.id;
}

/** Mod effect lines (EN/FR from game data), for tooltips. */
export async function gearAffixes(g: GearItem, lang: Lang): Promise<string[]> {
  const ids = [...(g.data.modId != null ? [g.data.modId] : []), ...g.data.mods];
  const mods = await Promise.all(ids.map(async (m) => (await getEntry('mods', String(m)))?.data.affix[lang] ?? []));
  return mods.flat().map((a) => a.replace(/<\/?gray>/g, ''));
}

/** One stat line as the game prints it: the effect, and its gray condition/requirement if any. */
export interface StatLine { text: string; gray?: string }
const statLine = (a: string): StatLine => {
  const m = a.match(/^(.*?)\s*<gray>(.*?)<\/gray>\s*$/);
  return m ? { text: m[1], gray: m[2] } : { text: a.replace(/<\/?gray>/g, '') };
};

/** A Gear item's stats from game data: the base item's line (damage, requirement) and each mod's lines. */
export async function gearStats(g: GearItem, lang: Lang) {
  const baseEntry = g.data.base != null ? await getEntry('items', String(g.data.base)) : undefined;
  const ids = [...(g.data.modId != null ? [g.data.modId] : []), ...g.data.mods];
  const mods = (await Promise.all(ids.map((m) => getEntry('mods', String(m))))).filter((m) => m != null);
  return {
    base: baseEntry && { id: baseEntry.data.id, name: baseEntry.data.name[lang], lines: baseEntry.data.affix[lang].map(statLine) },
    mods: mods.map((m) => ({ id: m.data.id, name: m.data.name[lang], lines: m.data.affix[lang].map(statLine) })),
  };
}

export const wikiUrl =(title: string) => `https://wiki.guildwars.com/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

/** Guild Wars Wiki page: `wiki` if set, else the mod's or the base item's English name. */
export async function gearWiki(g: GearItem): Promise<string | undefined> {
  if (g.data.wiki) return wikiUrl(g.data.wiki);
  if (g.data.modId != null) {
    const n = (await getEntry('mods', String(g.data.modId)))?.data.name.en;
    return n ? wikiUrl(n) : undefined;
  }
  if (g.data.base != null) {
    const n = (await getEntry('items', String(g.data.base)))?.data.name.en;
    return n ? wikiUrl(n) : undefined;
  }
  return undefined;
}

/** Armor slots an armor set covers (empty for a weapon set). */
export const slotsOf = (s: GearSet): ArmorSlot[] => ARMOR_SLOTS.filter((k) => s.data.pieces?.[k]);

export interface Loadout { armor?: string; weapons: string[] }

/** A Build's Loadout over its core's: the Build's armor set replaces the core's; weapon sets add up. */
export async function mergedLoadout(e: Entity<'core' | 'build'>): Promise<Loadout> {
  const own = { armor: e.data.loadout.armor && refId(e.data.loadout.armor), weapons: (e.data.loadout.weapons ?? []).map(refId) };
  if (e.data.kind === 'core') return own;
  const core = await entity(e.data.core, 'core');
  const base: Loadout = core ? await mergedLoadout(core) : { weapons: [] };
  return { armor: own.armor ?? base.armor, weapons: [...new Set([...base.weapons, ...own.weapons])] };
}

export interface GearNeed {
  set: string;
  level: Level;
  /** Duties that call for it; empty = always. */
  duties: string[];
  reason?: Tr;
}

/** Gear needs of a Build core or Build, the Build's own winning over its core's for the same set. */
export async function gearNeedsOf(e: Entity<'core' | 'build'>): Promise<GearNeed[]> {
  const toNeed = (g: (typeof e.data.gear)[number]): GearNeed => ({ set: refId(g.set), level: g.level, duties: g.duties.map(refId), reason: g.reason });
  const own = e.data.gear.map(toNeed);
  if (e.data.kind === 'core') return own;
  const core = await entity(e.data.core, 'core');
  const inherited = core ? (await gearNeedsOf(core)).filter((n) => !own.some((o) => o.set === n.set)) : [];
  return [...inherited, ...own].sort(byLevel);
}

/**
 * The Gear a Build needs while carrying `duties`: needs with no Duty, plus needs naming one of them.
 * `duties` on each result narrows to the ones that matched.
 */
export async function gearFor(e: Entity<'core' | 'build'>, duties: string[]): Promise<GearNeed[]> {
  const set = new Set(duties.map(baseId));
  return (await gearNeedsOf(e))
    .filter((n) => n.duties.length === 0 || n.duties.some((d) => set.has(d)))
    .map((n) => ({ ...n, duties: n.duties.filter((d) => set.has(d)) }));
}

/** Combine needs from several sources (e.g. one Role's Duties): one row per set, strongest level. */
export function combineNeeds(needs: GearNeed[]): GearNeed[] {
  const out = new Map<string, GearNeed>();
  for (const n of needs) {
    const prev = out.get(n.set);
    if (!prev) out.set(n.set, { ...n, duties: [...n.duties] });
    else {
      prev.level = stronger(prev.level, n.level);
      // "always" wins over a Duty list
      prev.duties = prev.duties.length === 0 || n.duties.length === 0 ? [] : [...new Set([...prev.duties, ...n.duties])];
      prev.reason ??= n.reason;
    }
  }
  return [...out.values()].sort(byLevel);
}

/** Gear needs that name this Duty, with the core or Build they're on. */
export async function gearNeedsForDuty(dutyId: string) {
  const b = baseId(dutyId);
  const holders = [...(await entities('core')), ...(await entities('build'))] as Entity<'core' | 'build'>[];
  const out: { holder: Entity<'core' | 'build'>; need: GearNeed }[] = [];
  for (const h of holders)
    for (const g of h.data.gear)
      if (g.duties.some((d) => refId(d) === b)) out.push({ holder: h, need: { set: refId(g.set), level: g.level, duties: [b], reason: g.reason } });
  return out.sort((x, y) => byLevel(x.need, y.need));
}

/** Everything a Role brings in one Strategy: its Build's Loadout, Gear needs for its Duties, Consumables. */
export async function kitFor(strategy: Entity<'strategy'>, row: StrategyRole) {
  const duties = row.duties.map(refId);
  const build = row.build ? await entity(row.build, 'build') : undefined;
  return {
    build,
    loadout: build ? await mergedLoadout(build) : undefined,
    gear: build ? combineNeeds(await gearFor(build, duties)) : [],
    consumables: await needsFor([zoneIdOfStrategy(strategy.id), strategy.id, refId(row.role), ...duties]),
  };
}

// ---------- Consumables ----------

export const targetId = (r: Requirement) => {
  const t = r.target;
  return refId(t.type === 'zone' ? t.zone : t.type === 'strategy' ? t.strategy : t.type === 'role' ? t.role : t.duty);
};

export interface Need { item: Consumable; req: Requirement; via: string }

/** Consumables whose Requirements target one of `targets` (`via` = which target matched), strongest first. */
export async function needsFor(targets: string[]): Promise<Need[]> {
  const set = new Set(targets.map(baseId));
  const out: Need[] = [];
  for (const item of await getCollection('consumables'))
    for (const req of item.data.requirements) if (set.has(targetId(req))) out.push({ item, req, via: targetId(req) });
  // one row per item: keep its strongest Requirement
  const best = new Map<string, Need>();
  for (const n of out) {
    const prev = best.get(n.item.id);
    if (!prev || LEVEL_RANK[n.req.level] < LEVEL_RANK[prev.req.level]) best.set(n.item.id, n);
  }
  return [...best.values()].sort((a, b) => byLevel(a.req, b.req));
}

export const consumableName = (c: Consumable, lang: Lang) => (lang === 'fr' && c.data.nameFr ? c.data.nameFr : c.data.gwwTitle);
export const consumableWiki = (c: Consumable) => wikiUrl(c.data.gwwTitle);
