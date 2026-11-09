# Content model

Type: grilling
Status: resolved
Blocked by:

## Question

What are the fields and relations of each entity — Build core, Build, Zone, Role, Duty, Party setup, Gear, Consumable, Requirement — independent of storage? How does a Build express "core + slot swaps"? How does a Role's Duty list vary per Party setup? Which fields are shared structured data and which are translated prose? Walk through the VoS FoW v1–v4 case as the concrete test.

## Answer

Settled in a grilling session with the user. Glossary terms are in `CONTEXT.md` (Loadout and Skill are new; Build core, Build, Role, Duty, Party setup, Gear, Consumable and Requirement were sharpened). Fields and relations, independent of storage:

- **Skill:** game data identified by the game skill ID. Official EN/FR name, description, stats and icon come from synced data. Optional **nickname** (IAU, stab, battle stand), written once and shared by both languages. We never write or translate skill text.
- **Build core:**
  - primary profession and an optional secondary
  - attributes
  - **1–8 fixed skills**; the remaining slots are open. With all 8 fixed, the core is a complete bar with its own template code (the VoS core: `OgCjkirMrSmXfbaXNX3lcXsX5iA`, D/–, Scythe 8 / Earth 12 / Mysticism 10).
  - a Loadout
  - translated title, summary and prose
- **Build:**
  - a reference to one core plus **its own template code, pasted by the author** (the bar tested in game). Swaps ("Dwarven Stability → I Am Unstoppable!"), filled open slots, an added secondary profession and attributes are all **derived** by comparing the code with the core, so code and swaps can't disagree. The primary profession must match the core, and a secondary fixed by the core must be kept.
  - per slot: an optional translated **note**, plus optional **alternative skills** the player can take instead, each with its own note. An alternative can imply a different secondary profession (Death's Charge → D/A).
  - its Loadout is the core's, with overrides per slot or per weapon set
  - translated title, summary and prose
  - runs under one or more Roles, in any Zone. Its page lists them.
- **Zone:** in-game name from game data (FR from GWiki.fr), its Roles, its Duties in run order, and its Party setups, exactly one of which is the default. Translated prose.
- **Role:** a shared label (v1…), one Zone and **exactly one Build**. It keeps its identity across Party setups. Translated prose. A Role always points to a Build, never directly to a core; a Build with no swaps equals the core bar.
- **Duty:** a shared English label (ToC, griffs…), one Zone and a place in that Zone's run order. Translated prose. A technique shared across Zones is not modeled.
- **Party setup:** a shared label and one Zone. It lists the Roles that take part, and the Duties each one carries. When a setup changes a bar, that is not modeled; prose shows it with a bar block.
- **Gear:** one of: a weapon (base type plus mods), a weapon set (the weapons on one in-game weapon bar), a rune or an insignia. Names come from game data by ID. Specific named PvE items have no game ID in the data and are identified by their English Guild Wars Wiki title. Armor pieces are not Gear; a Loadout lists insignia + rune per armor slot, plus the headpiece attribute. Has Requirements and translated prose. Its page shows "worn by" (from Loadouts) and its Requirements.
- **Loadout:** what a core or Build wears. It doesn't say how necessary anything is; Requirements do that.
- **Consumable:** identified by its English Guild Wars Wiki title, with the FR name looked up on GWiki.fr and checked by hand. A **kind**: `cons` (Essence/Grail/Armor), `summoning stones`, `powerstones`, `sweets/alcohol` or `other`. Has Requirements and translated prose.
- **Requirement:** a level (required / recommended / optional) × a target (Zone, Role or Duty), plus an optional translated **reason**. Authoring guideline: target Duties by default (they stay correct in every setup), Roles only when it really is about the Role, and Zones for needs that span the whole run.
- **Blocks in prose** (Notion-style, block-structured content):
  - **bar block:** a template code or a Build reference, rendered with names and icons in the reader's language. From a raw code it is display-only: not a Build, with no Loadout or Requirements, and not listed on index pages.
  - **gear block:** references an existing Gear entry. No ad-hoc gear.
  - the duty badge, loop and video blocks already planned
- **Language rule:**
  - Shared, English, never translated: community labels (Roles, Duties, Party setups, core names, skill nicknames).
  - Translated: titles, summaries, prose and notes.
  - From game data, never translated: in-game names (skills, items, Zones, consumables).
- **FoW test:** the model handles the known cases:
  - the D/– core
  - v3 swapping stab → IAU (armor and cripple; IAU can't be maintained, so that's a slot note)
  - battle stand → Ebon Escape or Death's Charge, as slot alternatives or as separate Builds for different Roles. The model allows both; Death's Charge implies D/A.

  The full v1–v4 Duty list is content for the content session. The skeleton uses the known swaps with placeholder Duties.
- **New ticket:** the user wants a visual, Notion-style block editor that saves to git. This is [Visual editor](08-visual-editor.md), which blocks [Storage mapping](05-storage-mapping.md).
