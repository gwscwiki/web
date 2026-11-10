import type { Lang } from './gw/names';

const strings = {
  fr: {
    required: 'Requis', recommended: 'Recommandé', optional: 'Optionnel',
    roles: 'Rôles', duties: 'Duties', build: 'Build', core: 'Core', builds: 'Builds',
    defaultSetup: 'Setup par défaut', otherSetups: 'Autres setups', setup: 'Setup',
    runOrder: 'Ordre du run', runs: 'Runs complets', whatToBring: 'À prévoir', needs: 'Équipement et consommables',
    carriedBy: 'Assuré par', wornBy: 'Porté par', requirements: 'Exigences', none: 'Aucun',
    swaps: 'Substitutions par rapport au core', noSwaps: 'Aucune substitution : identique au core.',
    filled: 'Cases libres remplies', alternatives: 'Alternatives', loadout: 'Équipement porté',
    runningRoles: 'Joué par', notTranslated: 'pas encore traduit', copy: 'Copier le code',
    weaponSet: 'Set d’armes', head: 'Tête', chest: 'Torse', hands: 'Mains', legs: 'Jambes', feet: 'Pieds',
    via: 'via', zone: 'Zone', role: 'Rôle', duty: 'Duty', level: 'Niveau', type: 'Type', all: 'Tous',
    watchRun: 'Voir le run à', noLoop: 'Extrait du run complet', secondary: 'secondaire',
    weapons: 'Armes', 'weapon-sets': 'Sets d’armes', runes: 'Runes', insignias: 'Insignes',
    cons: 'Cons', 'summoning-stones': 'Pierres d’invocation', powerstones: 'Pierres de puissance',
    'sweets-alcohol': 'Sucreries / alcool', other: 'Autre', energy: 'Énergie', activation: 'Incantation', recharge: 'Recharge',
  },
  en: {
    required: 'Required', recommended: 'Recommended', optional: 'Optional',
    roles: 'Roles', duties: 'Duties', build: 'Build', core: 'Core', builds: 'Builds',
    defaultSetup: 'Default setup', otherSetups: 'Other setups', setup: 'Setup',
    runOrder: 'Run order', runs: 'Full runs', whatToBring: 'What to bring', needs: 'Gear and consumables',
    carriedBy: 'Carried by', wornBy: 'Worn by', requirements: 'Requirements', none: 'None',
    swaps: 'Swaps against the core', noSwaps: 'No swaps: same as the core.',
    filled: 'Open slots filled', alternatives: 'Alternatives', loadout: 'Loadout',
    runningRoles: 'Run by', notTranslated: 'not yet translated', copy: 'Copy code',
    weaponSet: 'Weapon set', head: 'Head', chest: 'Chest', hands: 'Hands', legs: 'Legs', feet: 'Feet',
    via: 'via', zone: 'Zone', role: 'Role', duty: 'Duty', level: 'Level', type: 'Type', all: 'All',
    watchRun: 'Watch the run at', noLoop: 'Clip from the full run', secondary: 'secondary',
    weapons: 'Weapons', 'weapon-sets': 'Weapon sets', runes: 'Runes', insignias: 'Insignias',
    cons: 'Cons', 'summoning-stones': 'Summoning stones', powerstones: 'Powerstones',
    'sweets-alcohol': 'Sweets / alcohol', other: 'Other', energy: 'Energy', activation: 'Activation', recharge: 'Recharge',
  },
} as const;

export type UiKey = keyof (typeof strings)['fr'];
export const t = (lang: Lang) => (key: UiKey | string) => (strings[lang] as Record<string, string>)[key] ?? key;
export const langFromLocals = (locals: App.Locals): Lang => (locals.starlightRoute.lang === 'en' ? 'en' : 'fr');
