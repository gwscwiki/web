/**
 * Game icons, keyed by game IDs (docs/design-system.md § Icons).
 *
 *   <root>/skills/<skill id>.*        skill ID (template codes, skilldata.json)
 *   <root>/items/<item id>.*          equipment-template item ID (Gear `base`: weapons)
 *   <root>/mods/<mod id>.*            equipment-template mod ID (Gear `modId`: runes, insignias)
 *   <root>/consumables/<slug>.*       Consumable file name (no game ID exists)
 *
 * Two roots, first match wins:
 *   src/assets/icons/manual/   committed, hand-picked (weapon bases, overrides)
 *   src/assets/icons/synced/   gitignored, filled from the Guild Wars Wiki by scripts/sync-icons.mjs
 * A missing icon is never an error: <GameIcon> draws a placeholder.
 */
import type { ImageMetadata } from 'astro';

export type IconKind = 'skill' | 'item' | 'mod' | 'consumable';
const FOLDER: Record<IconKind, string> = { skill: 'skills', item: 'items', mod: 'mods', consumable: 'consumables' };

type Mod = { default: ImageMetadata };
const manual = import.meta.glob<Mod>('/src/assets/icons/manual/*/*.{png,jpg,jpeg,webp,svg}', { eager: true });
const synced = import.meta.glob<Mod>('/src/assets/icons/synced/*/*.{png,jpg,jpeg,webp}', { eager: true });

const index = new Map<string, ImageMetadata>();
for (const files of [synced, manual]) {
  // manual last, so it overwrites synced
  for (const [path, mod] of Object.entries(files)) {
    const m = path.match(/\/icons\/(?:manual|synced)\/([^/]+)\/([^/]+)\.\w+$/);
    if (m) index.set(`${m[1]}/${m[2]}`, mod.default);
  }
}

export function iconFor(kind: IconKind, key: number | string | undefined | null): ImageMetadata | undefined {
  if (key == null || key === '' || key === 0) return undefined;
  return index.get(`${FOLDER[kind]}/${key}`);
}

/** Icon for a Gear item: rune/insignia → its mod, weapon → its base item (manual folder). */
export function iconForGear(g: { data: { modId?: number; base?: number } }): ImageMetadata | undefined {
  return iconFor('mod', g.data.modId) ?? iconFor('item', g.data.base);
}

/** Icon for a Consumable: keyed by its file name (cons/essence-of-celerity → essence-of-celerity). */
export function iconForConsumable(c: { id: string }): ImageMetadata | undefined {
  return iconFor('consumable', c.id.split('/').pop());
}
