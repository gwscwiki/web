# Gear and Consumables are data without pages; Gear sets bind to Builds by Duty

Gear (weapons, runes, insignias) and Consumables are YAML data collections (`src/content/gear/`, `src/content/consumables/`) with no page of their own. Wherever they appear, they link to their Guild Wars Wiki page: the `wiki` title if set, otherwise the English game-data name of the mod or base item (Consumables: `gwwTitle`). The catalog still keys icons and names by game ID (ADR 0002).

Gear is grouped into **Gear sets** (`src/content/gear-sets/armor/`, `…/weapons/`). An armor set lists only the slots it covers, so a headpiece alone is an armor set; swapped in, it overrides the base armor for those slots. A Build core or Build has a **Loadout** (one base armor set and the weapon sets it carries) and **Gear needs**: a set, a level, and the Duties that call for it (none = always). A Build inherits its core's needs. The Gear a Role brings in a Strategy is its Build's Loadout plus the Gear needs matching the Duties it carries there, one row per set at its strongest level.

Party setups became **Strategies**: pages under `<zone>/strategies/`, giving each Role its Build and Duties, with source credits.

This supersedes the Gear and Consumable parts of ADR 0001 (they no longer have French/English page pairs) and of the Information architecture ticket (type folders now hold data, not pages; the Gear and Consumable indexes are gone).

## Considered options

- **Keep a page per Gear item** (the skeleton): mostly duplicated the Guild Wars Wiki, and Requirements on items couldn't say "this shield, for this Build, only on the bridge".
- **Requirements on Gear targeting Zone/Role/Duty** (the skeleton): a Role runs different Builds across Strategies, so Role-targeted gear was wrong as soon as a second Strategy existed.
- **Gear needs keyed by Role and Strategy**: repeats the same shield for every Strategy where a VoS does the bridge. Keying by Build × Duty states it once.

## Consequences

- Consumables keep Requirements (Zone, Strategy, Role or Duty); only Gear moved to Gear needs.
- Gear needs have no Strategy scope: if one Strategy wants different gear for the same Build and Duty, that needs a new field.
- The Guild Wars Wiki is English-only, so French readers land on English pages.
