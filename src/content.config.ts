import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { itemsLoader, modsLoader, skillsLoader } from './loaders/gw-data';

/** A translated string inside shared data (Storage mapping): French required, English optional. */
const tr = z.object({ fr: z.string(), en: z.string().optional() });
const doc = reference('docs');

const requirement = z.object({
  level: z.enum(['required', 'recommended', 'optional']),
  target: z.discriminatedUnion('type', [
    z.object({ type: z.literal('zone'), zone: doc }),
    z.object({ type: z.literal('role'), role: doc }),
    z.object({ type: z.literal('duty'), duty: doc }),
  ]),
  reason: tr.optional(),
});

const armorPiece = z.object({ insignia: doc.optional(), rune: doc.optional(), attribute: z.number().optional() });
const loadout = z.object({
  weaponSets: z.array(z.object({ id: z.string(), weapons: z.array(doc) })).optional(),
  armor: z
    .object({ head: armorPiece, chest: armorPiece, hands: armorPiece, legs: armorPiece, feet: armorPiece })
    .partial()
    .optional(),
});

/**
 * Every entity with a page is docs MDX typed by `kind` (Storage mapping). Shared fields live only in
 * the French file; English twins have no `kind` and fall into the plain-page branch.
 * Gear type and Consumable kind come from the folder (Information architecture), not frontmatter.
 */
const entity = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('zone'),
    roles: z.array(doc),
    duties: z.array(doc),
    runs: z
      .array(
        z.object({
          id: z.string(),
          youtube: z.string(),
          setup: reference('partySetups'),
          date: z.coerce.date(),
          runner: z.string(),
          lang: z.enum(['fr', 'en', 'none']),
        }),
      )
      .default([]),
  }),
  z.object({ kind: z.literal('role'), label: z.string(), build: doc }),
  z.object({
    kind: z.literal('duty'),
    label: z.string(),
    run: z.object({ id: z.string(), at: z.string().regex(/^\d+(:\d{2}){1,2}$/) }).optional(),
  }),
  z.object({ kind: z.literal('core'), label: z.string(), code: z.string(), loadout: loadout.default({}) }),
  z.object({
    kind: z.literal('build'),
    core: doc,
    code: z.string(),
    loadout: loadout.default({}),
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
  z.object({
    kind: z.literal('gear'),
    modId: z.number().optional(),
    base: z.number().optional(),
    mods: z.array(z.number()).default([]),
    gwwTitle: z.string().optional(),
    requirements: z.array(requirement).default([]),
  }),
  z.object({
    kind: z.literal('consumable'),
    gwwTitle: z.string(),
    nameFr: z.string(),
    requirements: z.array(requirement).default([]),
  }),
  z.object({ kind: z.undefined().optional() }),
]);

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema({ extend: entity }) }),
  partySetups: defineCollection({
    loader: glob({ pattern: '*.yaml', base: 'src/content/party-setups' }),
    schema: z.object({
      zone: doc,
      label: z.string(),
      default: z.boolean().default(false),
      roles: z.array(z.object({ role: doc, duties: z.array(doc) })),
    }),
  }),
  skills: defineCollection({ loader: skillsLoader() }),
  mods: defineCollection({ loader: modsLoader() }),
  items: defineCollection({ loader: itemsLoader() }),
};
