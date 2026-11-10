/**
 * Profession and attribute names, keyed by template-code IDs.
 * Not in build-wars data, so hand-entered. French names below are the official in-game
 * strings as far as we know — VERIFY against GWiki.fr before publishing. Missing French
 * entries fall back to English.
 */
export type Lang = 'fr' | 'en';

export const PROFESSIONS: Record<number, { abbr: string; en: string; fr: string }> = {
  0: { abbr: '–', en: 'None', fr: 'Aucune' },
  1: { abbr: 'W', en: 'Warrior', fr: 'Guerrier' },
  2: { abbr: 'R', en: 'Ranger', fr: 'Rôdeur' },
  3: { abbr: 'Mo', en: 'Monk', fr: 'Moine' },
  4: { abbr: 'N', en: 'Necromancer', fr: 'Nécromant' },
  5: { abbr: 'Me', en: 'Mesmer', fr: 'Envoûteur' },
  6: { abbr: 'E', en: 'Elementalist', fr: 'Élémentaliste' },
  7: { abbr: 'A', en: 'Assassin', fr: 'Assassin' },
  8: { abbr: 'Rt', en: 'Ritualist', fr: 'Ritualiste' },
  9: { abbr: 'P', en: 'Paragon', fr: 'Parangon' },
  10: { abbr: 'D', en: 'Dervish', fr: 'Derviche' },
};

const ATTR_EN = [
  'Fast Casting', 'Illusion Magic', 'Domination Magic', 'Inspiration Magic', 'Blood Magic', 'Death Magic',
  'Soul Reaping', 'Curses', 'Air Magic', 'Earth Magic', 'Fire Magic', 'Water Magic', 'Energy Storage',
  'Healing Prayers', 'Smiting Prayers', 'Protection Prayers', 'Divine Favor', 'Strength', 'Axe Mastery',
  'Hammer Mastery', 'Swordsmanship', 'Tactics', 'Beast Mastery', 'Expertise', 'Wilderness Survival',
  'Marksmanship', '', '', '', 'Dagger Mastery', 'Deadly Arts', 'Shadow Arts', 'Communing',
  'Restoration Magic', 'Channeling Magic', 'Critical Strikes', 'Spawning Power', 'Spear Mastery',
  'Command', 'Motivation', 'Leadership', 'Scythe Mastery', 'Wind Prayers', 'Earth Prayers', 'Mysticism',
];
const ATTR_FR: Record<number, string> = {
  29: 'Maîtrise de la dague', 30: 'Arts mortels', 31: 'Arts des ombres', 35: 'Prouesse critique',
  41: 'Maîtrise de la faux', 42: 'Prières du vent', 43: 'Prières de la Terre', 44: 'Mysticisme',
};

export function attributeName(id: number, lang: Lang): string {
  return (lang === 'fr' && ATTR_FR[id]) || ATTR_EN[id] || `#${id}`;
}
export function professionName(id: number, lang: Lang): string {
  return PROFESSIONS[id]?.[lang] ?? `#${id}`;
}
