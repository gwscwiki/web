/**
 * Game data → Guild Wars Wiki icon file names, and file name → image URL.
 * Pure functions; used by scripts/sync-icons.mjs. Rules and tables come from
 * .scratch/gw-kb/research/icon-sources.md (§3), checked against GWW on 2026-11-10.
 *
 * GWW stores a file at /images/<md5[0]>/<md5[0..2]>/<name>. Building the URL ourselves means we never
 * call api.php, which GWW's robots.txt disallows (it allows /images/).
 */
import { createHash } from 'node:crypto';

export const GWW_IMAGES = 'https://wiki.guildwars.com/images';

export function gwwImageUrl(file) {
  const f = file.replace(/ /g, '_');
  const h = createHash('md5').update(f, 'utf8').digest('hex');
  return `${GWW_IMAGES}/${h[0]}/${h.slice(0, 2)}/${encodeURIComponent(f)}`;
}

const PROFESSION_EN = ['', 'Warrior', 'Ranger', 'Monk', 'Necromancer', 'Mesmer', 'Elementalist', 'Assassin', 'Ritualist', 'Paragon', 'Dervish'];

/** Non-profession runes share three icons (moddata `icon` → file). */
const RUNE_BY_ICON = { 151852: 'Rune All Minor.png', 151853: 'Rune All Major.png', 151854: 'Rune Vigor Sup.png' };

/** Weapon prefixes/suffixes: one icon per component (moddata `icon` → file). */
const COMPONENT_BY_ICON = {
  19872: 'Axe Haft.png', 91655: 'Bow String.png', 19873: 'Hammer Haft.png', 20015: 'Sword Hilt.png',
  164795: 'Staff Head.png', 164837: 'Dagger Tang.png', 205895: 'Scythe Snathe.png', 205896: 'Spearhead.png',
  91650: 'Axe Grip.png', 91653: 'Bow Grip.png', 91654: 'Hammer Grip.png', 164796: 'Staff Wrapping.png',
  91656: 'Sword Pommel.png', 164856: 'Dagger Handle.png', 205917: 'Scythe Grip.png', 205921: 'Spear Grip.png',
  205913: 'Focus Core.png', 205916: 'Wand Wrapping.png', 205920: 'Shield Handle.png',
};

/** Inscriptions: one icon per item class (moddata `for` → file). Inferred mapping; eyeball once. */
const INSCRIPTION_BY_FOR = {
  37: 'Inscription weapons.png',
  38: 'Inscription martial weapons.png',
  39: 'Inscription equippable items.png',
  12: 'Inscription focus items.png',
  41: 'Inscription focus items or shields.png',
};

/**
 * Skill icon: `<English name>.jpg`. PvP versions use their PvE skill's icon (`split_id`).
 * @param {number} id  @param {Record<number, any>} skilldata  @param {Record<number, {name: string}>} descEn
 */
export function skillIconFile(id, skilldata, descEn) {
  const d = skilldata[id];
  if (!d) return undefined;
  const base = d.is_pvp && d.split_id ? d.split_id : id;
  const name = descEn[base]?.name;
  return name ? `${name}.jpg` : undefined;
}

/** Rune, insignia, weapon component or inscription icon from a moddata entry. */
export function modIconFile(mod) {
  if (!mod) return undefined;
  const name = mod.lang?.en?.name ?? '';
  if (mod.type === 3) return INSCRIPTION_BY_FOR[mod.for];
  if (mod.for === 1 && mod.type === 1) return `${name}.png`; // insignia: one icon each
  if (mod.for === 1 && mod.type === 2) {
    if (RUNE_BY_ICON[mod.icon]) return RUNE_BY_ICON[mod.icon];
    const tier = name.match(/Rune of (Minor|Major|Superior) /)?.[1];
    const prof = PROFESSION_EN[mod.profession];
    return prof && tier ? `Rune ${prof} ${tier === 'Superior' ? 'Sup' : tier}.png` : undefined;
  }
  return COMPONENT_BY_ICON[mod.icon];
}

/** Consumable icon from its GWW page title. */
export const consumableIconFile = (gwwTitle) => (gwwTitle ? `${gwwTitle}.png` : undefined);
