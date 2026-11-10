import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { itemsLoader, modsLoader, skillsLoader } from './loaders/gw-data';

/** A translated string inside shared data (Storage mapping): French required, English optional. */
const tr = z.object({ fr: z.string(), en: z.string().optional() });
const doc = reference('docs');
const level = z.enum(['required', 'recommended', 'optional']);

/** How necessary a Consumable is, for a Zone, Strategy, Role (of one Strategy) or Duty. */
const requirement = z.object({
  level,
  target: z.discriminatedUnion('type', [
    z.object({ type: z.literal('zone'), zone: doc }),
    z.object({ type: z.literal('strategy'), strategy: doc }),
    z.object({ type: z.literal('role'), strategy: doc, role: z.string() }),
    z.object({ type: z.literal('duty'), duty: doc }),
  ]),
  reason: tr.optional(),
});

/** What a Build core or Build wears by default: one base armor set and the weapon sets it carries. */
const loadout = z.object({
  armor: reference('gearSets').optional(),
  weapons: z.array(reference('gearSets')).default([]),
});

/**
 * A Gear set bound to a Build core or Build, with how necessary it is. `duties` empty = whatever the
 * Build is doing; otherwise only while it carries one of those Duties. An armor set here is swapped
 * over the base armor for the slots it covers.
 */
const gearNeed = z.object({
  set: reference('gearSets'),
  level,
  duties: z.array(doc).default([]),
  reason: tr.optional(),
});

/**
 * A Role in a Strategy: its name as the source gives it (T1, MT, V1…), the Build it runs and the
 * Duties it carries, in route order. Roles have no pages: a Role only exists within its Strategy.
 */
const strategyRole = z.object({
  role: z.string(),
  /** Missing when the source publishes no bar for this Role. */
  build: doc.optional(),
  duties: z.array(doc).default([]),
  /** The source's own route wording, verbatim (community English shorthand). */
  route: z.string().optional(),
  note: tr.optional(),
});

/** Where an entity's content comes from, for credit (shown at the foot of its page). */
const source = z.object({
  title: z.string(),
  url: z.url(),
  site: z.string().optional(),
  author: z.string().optional(),
  edited: z.coerce.date().optional(),
});
const sources = z.array(source).default([]);

/**
 * Every entity with a page is docs MDX typed by `kind` (Storage mapping). Shared fields live only in
 * the French file; English twins have no `kind` and fall into the plain-page branch.
 * Gear, Gear sets and Consumables have no pages: they are data collections below.
 */
const entity = ({ image }: SchemaContext) => z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('zone'),
    sources,
    /** Parts of the map its Duties are grouped by, in sidebar order. */
    regions: z.array(z.object({ id: z.string(), name: tr })),
    /** A map of the Zone, credited to its author. */
    map: z.object({ image: image(), alt: tr, author: z.string(), source: z.url() }).optional(),
    /** Run order. */
    duties: z.array(doc),
    runs: z
      .array(
        z.object({
          id: z.string(),
          youtube: z.string(),
          strategy: doc,
          date: z.coerce.date(),
          runner: z.string(),
          lang: z.enum(['fr', 'en', 'none']),
        }),
      )
      .default([]),
  }),
  z.object({
    kind: z.literal('strategy'),
    label: z.string(),
    default: z.boolean().default(false),
    /** Typical clear time, as the source gives it ("~7 min"). */
    time: z.string().optional(),
    roles: z.array(strategyRole),
    sources,
  }),
  z.object({
    kind: z.literal('duty'),
    label: z.string(),
    /** Region of its Zone (an id from the Zone's `regions`). */
    region: z.string(),
    sources,
    run: z.object({ id: z.string(), at: z.string().regex(/^\d+(:\d{2}){1,2}$/) }).optional(),
  }),
  z.object({
    kind: z.literal('core'),
    label: z.string(),
    sources,
    code: z.string(),
    loadout: loadout.default({ weapons: [] }),
    gear: z.array(gearNeed).default([]),
  }),
  z.object({
    kind: z.literal('build'),
    core: doc,
    sources,
    code: z.string(),
    loadout: loadout.partial().default({}),
    gear: z.array(gearNeed).default([]),
    skillNotes: z
      .array(
        z.object({
          skill: z.number(),
          note: tr.optional(),
          alternatives: z.array(z.object({ skill: z.number(), note: tr.optional() })).default([]),
        }),
      )
      .default([]),
  }),
  z.object({ kind: z.undefined().optional() }),
]);

/** One armor piece of an armor set. `attribute` = the headpiece's +1 attribute (game ID). */
const piece = z.object({
  insignia: reference('gear').optional(),
  rune: reference('gear').optional(),
  attribute: z.number().optional(),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema({ extend: entity }) }),

  /**
   * Gear catalog, no pages (ADR 0003). Type = folder: weapons/, runes/, insignias/.
   * Name and icon come from game data (`modId`, or `base` + `mods`); `name` covers pieces the data
   * can't express (an unspecified shield). `wiki` overrides the Guild Wars Wiki page title.
   */
  gear: defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: 'src/content/gear' }),
    schema: z.object({
      modId: z.number().optional(),
      base: z.number().optional(),
      mods: z.array(z.number()).default([]),
      name: tr.optional(),
      wiki: z.string().optional(),
    }),
  }),

  /**
   * Gear sets, no pages. Type = folder: armor/ (full or partial: a headpiece alone is an armor set)
   * and weapons/ (what goes in one weapon-set slot: a two-hander, or main hand plus off-hand).
   */
  gearSets: defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: 'src/content/gear-sets' }),
    schema: z.object({
      name: tr,
      pieces: z.object({ head: piece, chest: piece, hands: piece, legs: piece, feet: piece }).partial().optional(),
      weapons: z.array(reference('gear')).optional(),
      note: tr.optional(),
    }),
  }),

  /** Consumables, no pages. Kind = folder: cons/, summoning-stones/, powerstones/, sweets-alcohol/, other/. */
  consumables: defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: 'src/content/consumables' }),
    schema: z.object({
      gwwTitle: z.string(),
      /** Verified in-game French name; English is shown until it's filled. */
      nameFr: z.string().optional(),
      requirements: z.array(requirement).default([]),
    }),
  }),

  skills: defineCollection({ loader: skillsLoader() }),
  mods: defineCollection({ loader: modsLoader() }),
  items: defineCollection({ loader: itemsLoader() }),
};
