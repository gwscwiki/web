/**
 * Build-time loaders for game data (Storage mapping): fetch build-wars JSON at a pinned
 * commit, keep only the IDs our content uses, expose them as read-only collections.
 * Nothing is committed. Downloads are cached under node_modules/.cache (CI caches it).
 */
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { BUILD_WARS_BASE, CACHE_DIR } from '../lib/gw/source.mjs';
import { CONTENT_DIR, scanUsedIds } from '../lib/gw/used-ids.mjs';

async function fetchJson(file: string): Promise<any> {
  const cached = join(CACHE_DIR, file);
  if (existsSync(cached)) return JSON.parse(await readFile(cached, 'utf8'));
  const res = await fetch(`${BUILD_WARS_BASE}/${file}`);
  if (!res.ok) throw new Error(`gw-data: ${file} → HTTP ${res.status}`);
  const text = await res.text();
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(cached, text);
  return JSON.parse(text);
}

const tr = z.object({ fr: z.string(), en: z.string() });

export const skillSchema = z.object({
  id: z.number(),
  name: tr,
  description: tr,
  concise: tr,
  profession: z.number(),
  attribute: z.number(),
  type: z.number(),
  elite: z.boolean(),
  energy: z.number(),
  activation: z.number(),
  recharge: z.number(),
  adrenaline: z.number(),
  upkeep: z.number(),
  sacrifice: z.number(),
  nickname: z.string().optional(),
});

export const modSchema = z.object({
  id: z.number(),
  profession: z.number().nullable(),
  attribute: z.number().nullable(),
  name: tr,
  affix: z.object({ fr: z.array(z.string()), en: z.array(z.string()) }),
});

export const itemSchema = z.object({ id: z.number(), name: tr, affix: z.object({ fr: z.array(z.string()), en: z.array(z.string()) }) });

function watchContent(watcher: any, reload: () => Promise<void>) {
  watcher?.on('change', (p: string) => {
    if (p.replace(/\\/g, '/').includes(`/${CONTENT_DIR}/`)) reload();
  });
}

export function skillsLoader(): Loader {
  return {
    name: 'gw-skills',
    schema: skillSchema,
    load: async ({ store, parseData, logger, watcher }) => {
      const run = async () => {
        const [data, en, fr, used] = await Promise.all([
          fetchJson('skilldata.json'), fetchJson('skilldesc-en.json'), fetchJson('skilldesc-fr.json'), scanUsedIds(),
        ]);
        const nickFile = join(CONTENT_DIR, 'skill-nicknames.yaml');
        const nicknames = new Map<number, string>(
          existsSync(nickFile)
            ? (parseYaml(await readFile(nickFile, 'utf8')) as { skill: number; nickname: string }[]).map((n) => [n.skill, n.nickname])
            : [],
        );
        store.clear();
        for (const id of used.skills) {
          const d = data.skilldata[id];
          const e = en.skilldesc[id];
          const f = fr.skilldesc[id] ?? e;
          if (!d || !e) { logger.warn(`unknown skill id ${id}`); continue; }
          const entry = await parseData({
            id: String(id),
            data: {
              id,
              name: { en: e.name, fr: f.name },
              description: { en: e.description, fr: f.description },
              concise: { en: e.concise, fr: f.concise },
              profession: d.profession,
              attribute: d.attribute,
              type: d.type,
              elite: d.is_elite,
              energy: d.energy,
              activation: d.activation,
              recharge: d.recharge,
              adrenaline: d.adrenaline,
              upkeep: d.upkeep,
              sacrifice: d.sacrifice,
              nickname: nicknames.get(id),
            },
          });
          store.set({ id: String(id), data: entry });
        }
        logger.info(`${used.skills.size} skills kept`);
      };
      await run();
      watchContent(watcher, run);
    },
  };
}

function langPair(lang: Record<string, { name: string; affix: string[] }>) {
  return {
    name: { en: lang.en.name, fr: lang.fr?.name ?? lang.en.name },
    affix: { en: lang.en.affix, fr: lang.fr?.affix ?? lang.en.affix },
  };
}

export function modsLoader(): Loader {
  return {
    name: 'gw-mods',
    schema: modSchema,
    load: async ({ store, parseData, logger, watcher }) => {
      const run = async () => {
        const [json, used] = await Promise.all([fetchJson('moddata.json'), scanUsedIds()]);
        store.clear();
        for (const id of used.mods) {
          const m = json.moddata[id];
          if (!m) { logger.warn(`unknown mod id ${id}`); continue; }
          const data = await parseData({ id: String(id), data: { id, profession: m.profession, attribute: m.attribute, ...langPair(m.lang) } });
          store.set({ id: String(id), data });
        }
      };
      await run();
      watchContent(watcher, run);
    },
  };
}

export function itemsLoader(): Loader {
  return {
    name: 'gw-items',
    schema: itemSchema,
    load: async ({ store, parseData, logger, watcher }) => {
      const run = async () => {
        const [json, used] = await Promise.all([fetchJson('itemdata.json'), scanUsedIds()]);
        store.clear();
        for (const id of used.items) {
          const m = json.itemdata[id];
          if (!m) { logger.warn(`unknown item id ${id}`); continue; }
          const data = await parseData({ id: String(id), data: { id, ...langPair(m.lang) } });
          store.set({ id: String(id), data });
        }
      };
      await run();
      watchContent(watcher, run);
    },
  };
}
