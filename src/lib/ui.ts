import type { Lang } from './gw/names';

const strings = {
  fr: {
    required: 'Requis', recommended: 'Recommandé', optional: 'Optionnel',
    roles: 'Rôles', duties: 'Duties', build: 'Build', core: 'Core', builds: 'Builds',
    defaultSetup: 'Stratégie par défaut',
    runOrder: 'Ordre du run', runs: 'Runs complets', whatToBring: 'À prévoir',
    carriedBy: 'Assuré par', none: 'Aucun',
    matrixCarries: 'Assure cette duty', matrixPresent: 'Dans la stratégie, autres duties', matrixAbsent: 'Absent de la stratégie',
    swaps: 'Substitutions par rapport au core', noSwaps: 'Aucune substitution : identique au core.',
    filled: 'Cases libres remplies', alternatives: 'Alternatives', loadout: 'Équipement de base',
    runningRoles: 'Joué par', notTranslated: 'pas encore traduit', copy: 'Copier le code',
    weaponSet: 'Set d’armes', head: 'Tête', chest: 'Torse', hands: 'Mains', legs: 'Jambes', feet: 'Pieds',
    via: 'via', zone: 'Zone', role: 'Rôle', duty: 'Duty', level: 'Niveau', type: 'Type', all: 'Tous',
    watchRun: 'Voir le run à', noLoop: 'Extrait du run complet', secondary: 'secondaire',
    weapons: 'Armes', 'weapon-sets': 'Sets d’armes', runes: 'Runes', insignias: 'Insignes',
    cons: 'Cons', 'summoning-stones': 'Pierres d’invocation', powerstones: 'Pierres de puissance',
    'sweets-alcohol': 'Sucreries / alcool', other: 'Autre', energy: 'Énergie', activation: 'Incantation', recharge: 'Recharge',
    adrenaline: 'Adrénaline', sacrifice: 'Sacrifice', openSlot: 'Case libre', copied: 'Copié !',
    markSwap: 'Substitution', markFilled: 'Case remplie', icon: 'Icône',
    strategies: 'Stratégies', strategy: 'Stratégie', players: 'joueurs', default: 'Par défaut', community: 'Communauté',
    source: 'Source', creditIntro: 'Documenté par la communauté speedclear. Résumé et traduit ici ; tout le mérite revient aux auteurs :',
    by: 'par', editedOn: 'modifiée le', composition: 'Composition', kitByRole: 'À prévoir, par rôle',
    kitHint: 'Pour chaque rôle : son build, son équipement de base, les sets requis par ses duties et les consommables.',
    consumables: 'Consommables', consumablesTeam: 'Consommables pour toute l’équipe', inNoStrategy: 'Dans aucune stratégie pour l’instant.',
    sourceRoute: 'Route d’origine', gearForDuty: 'Sets d’équipement pour cette duty', gearByDuty: 'Sets d’équipement par duty',
    gearForDuties: 'Sets pour ses duties', roleSlots: 'rôle(s)', baseArmor: 'Armure de base', noBaseArmor: 'Pas d’armure de base renseignée.',
    weaponSets: 'Sets d’armes', upgrades: 'Détail des mods', fullArmor: 'Armure complète', armorPart: 'Armure', always: 'toujours',
    noPublishedBuild: 'La source ne publie pas de barre pour ce rôle.',
    open: 'Ouvrir', skillNotes: 'Notes sur les compétences', slot: 'Emplacement', results: 'résultats', noResults: 'Aucun résultat pour ces filtres.', kicker: 'Speedclear Guild Wars', choosePath: 'Choisir sa voie',
  },
  en: {
    required: 'Required', recommended: 'Recommended', optional: 'Optional',
    roles: 'Roles', duties: 'Duties', build: 'Build', core: 'Core', builds: 'Builds',
    defaultSetup: 'Default strategy',
    runOrder: 'Run order', runs: 'Full runs', whatToBring: 'What to bring',
    carriedBy: 'Carried by', none: 'None',
    matrixCarries: 'Carries this duty', matrixPresent: 'In the strategy, other duties', matrixAbsent: 'Not in the strategy',
    swaps: 'Swaps against the core', noSwaps: 'No swaps: same as the core.',
    filled: 'Open slots filled', alternatives: 'Alternatives', loadout: 'Loadout',
    runningRoles: 'Run by', notTranslated: 'not yet translated', copy: 'Copy code',
    weaponSet: 'Weapon set', head: 'Head', chest: 'Chest', hands: 'Hands', legs: 'Legs', feet: 'Feet',
    via: 'via', zone: 'Zone', role: 'Role', duty: 'Duty', level: 'Level', type: 'Type', all: 'All',
    watchRun: 'Watch the run at', noLoop: 'Clip from the full run', secondary: 'secondary',
    weapons: 'Weapons', 'weapon-sets': 'Weapon sets', runes: 'Runes', insignias: 'Insignias',
    cons: 'Cons', 'summoning-stones': 'Summoning stones', powerstones: 'Powerstones',
    'sweets-alcohol': 'Sweets / alcohol', other: 'Other', energy: 'Energy', activation: 'Activation', recharge: 'Recharge',
    adrenaline: 'Adrenaline', sacrifice: 'Sacrifice', openSlot: 'Open slot', copied: 'Copied!',
    markSwap: 'Swapped', markFilled: 'Filled slot', icon: 'Icon',
    strategies: 'Strategies', strategy: 'Strategy', players: 'players', default: 'Default', community: 'Community',
    source: 'Source', creditIntro: 'Documented by the speedclear community, summarised here. All credit goes to the authors:',
    by: 'by', editedOn: 'edited', composition: 'Team', kitByRole: 'What to bring, by role',
    kitHint: 'For each role: its build, base gear, the sets its duties call for, and consumables.',
    consumables: 'Consumables', consumablesTeam: 'Consumables for the whole team', inNoStrategy: 'Not in any strategy yet.',
    sourceRoute: 'Original route', gearForDuty: 'Gear sets for this duty', gearByDuty: 'Gear sets by duty',
    gearForDuties: 'Sets for its duties', roleSlots: 'role slot(s)', baseArmor: 'Base armor', noBaseArmor: 'No base armor set.',
    weaponSets: 'Weapon sets', upgrades: 'Mod breakdown', fullArmor: 'Full armor', armorPart: 'Armor', always: 'always',
    noPublishedBuild: 'The source publishes no bar for this role.',
    open: 'Open', skillNotes: 'Skill notes', slot: 'Slot', results: 'results', noResults: 'Nothing matches these filters.', kicker: 'Guild Wars speedclear', choosePath: 'Choose your path',
  },
} as const;

export type UiKey = keyof (typeof strings)['fr'];
export const t = (lang: Lang) => (key: UiKey | string) => (strings[lang] as Record<string, string>)[key] ?? key;
/** Reader's language. Outside a resolved Starlight route (e.g. children of <StarlightPage>), French. */
export const langFromLocals = (locals: App.Locals): Lang => {
  try {
    return locals.starlightRoute.lang === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
};
