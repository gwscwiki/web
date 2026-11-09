# Skill & item data sources

Type: research
Status: resolved
Blocked by:

## Question

Where can the site get Guild Wars 1 skill data (name, description, energy/cast/recharge, attribute, profession) and skill icons, plus item/rune/insignia names, **in both English and French**? What licensing applies (e.g. GW Wiki content/icons) and what attribution is needed for a public site? Is there a maintained JS/TS library or spec for decoding/encoding GW skill template codes (and equipment templates) that could run at Astro build time?

## Comments

Research findings: `research/skill-and-item-data-sources` branch → `.scratch/gw-kb/research/skill-and-item-data-sources.md`

## Answer

**Use game IDs as keys and ArenaNet's own strings for game text.** The game skill ID is the same in template codes, the English Guild Wars Wiki (GWW), GWiki.fr and build-wars (e.g. VoS = 1759).

- **Skills:** `build-wars/gw-skilldata` (MIT, maintained). It has stats for every skill plus official in-game EN **and FR** names and descriptions. French is only in release 2.1.0 / the GitHub Pages JSON, not on npm yet (npm 2.0.0 has EN/DE only). Recommended: a `sync-gw-data` script, run by hand or in CI and pinned to a tag, that filters the JSON down to the IDs our content uses and commits the result. Descriptions contain markup (`<gray>`, `<sic/>`, French grammar tags like `[f:"…"]` and `[pl:"…"]`), so a small renderer is needed.
- **Runes, insignias, weapon mods:** build-wars `moddata.json` (EN/FR/…), keyed by equipment-template mod ID. `itemdata.json` has generic bases only (e.g. "Scythe" / "Faux").
- **Consumables and specific named PvE items:** not in any package or template format. Keep a small hand-made list keyed by the GWW English page title. The sync script fills in French names from GWiki.fr (`langbacklinks`), which then need a manual check (strip disambiguators like "(Objet)").
- **Template codes:** `@buildwars/gw-templates` 1.1.1 (MIT) decodes and encodes skill and equipment templates. Verified on Node 24 with a D/A VoS bar, so pin Node 24 in CI. Fallback: our own ~80-line decoder from the GWW spec. Equipment templates only express PvP-panel gear, so they **can't** serve as a general Gear model.
- **Icons:** 64×64 from GWW, fetched by the sync script for the skills we use, stored locally and served through `astro:assets`. Never hotlink.
- **Licensing:** the ArenaNet Content Use Policy (2025-10-28) governs game names, descriptions, icons and screenshots; the wikis grant nothing for those. Rules:
  - individual and non-commercial only
  - label the site as unofficial, including in `<title>` ("fansite / site non officiel")
  - show the verbatim ArenaNet notice in the footer of every page
  - no standalone data dump
  - "Translations of Our Content" are prohibited, so **never translate skill text**: show ArenaNet's French strings, and when one is missing use the "not yet translated" fallback.
  - Our own prose is original content and fine. Add a courtesy credit line for the data sources.
- **Left for Storage mapping:** whether to depend on build-wars' GitHub Pages files until French reaches npm.
