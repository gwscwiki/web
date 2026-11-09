# Storage mapping

Type: grilling
Status: claimed
Assignee: krumpyzoid
Blocked by: 02, 03, 08

## Question

How does each entity from the content model map onto Astro content collections — YAML/JSON data vs MD/MDX — with what Zod schemas and references? Where do French and English prose live relative to the shared data, and how is the fallback detected?

From [Starlight capabilities](02-starlight-capabilities.md): Starlight only falls back one way (French content for EN visitors). Decide how an English-only page is handled: a French-first rule plus a CI check, or the untested stub-and-middleware workaround. Also confirm or reject the suggested split: narrative entities as `docs` MDX, Gear/Consumables/skills as YAML data with `<StarlightPage>` routes.

From [Skill & item data sources](01-skill-and-item-data-sources.md): game data (skills, runes/insignias/mods) arrives from a sync script as filtered build-wars JSON keyed by game ID, plus local icons; consumables and named PvE items are a hand-kept list keyed by GWW English title with French names looked up and reviewed. Decide where synced data lives versus authored data, and whether to depend on build-wars' GitHub Pages files until French reaches npm.

From [Content model](03-content-model.md): map every entity listed there. Points that need a storage answer:
- Skill nicknames are authored, but the rest of a Skill is synced data. Where does the authored part live, and how is it joined by skill ID?
- A Build stores only its pasted template code and a core reference. Swaps, attributes and the secondary profession are derived at build time.
- Per-slot notes and alternatives on a Build.
- Loadout inheritance and per-slot overrides.
- The Party setup → Role → Duties assignment, with one default setup per Zone.
- Requirements, held on Gear and Consumables, each with a target and an optional translated reason.
- Bar and gear blocks in prose.

From [Visual editor](08-visual-editor.md): the chosen editor's file formats constrain all of this.

From [Visual editor](08-visual-editor.md): start by confirming the editor (Sveltia recommended) and settling the points it leaves to the human:
- version pinning
- contributor model
- whether players without a GitHub account must edit
- block syntax discipline
- one or two bar blocks

The chosen editor's formats then drive the mapping. With Sveltia:
- prose at `src/content/docs/[en/]<section>/<slug>.mdx`, or as page bundles
- one YAML/JSON file per data entry with slug relations
- polymorphic Requirement targets as `{ type, … }`
- localised strings in shared data, either per-locale keys or `{ fr, en }` objects; this ticket chooses

From [Media conventions](04-media-conventions.md): full-run videos are structured data on the Zone (url, Party setup, date, runner, commentary language), and a Duty may reference a run plus a timestamp. Decide where that data lives and how the Duty reference is stored. Media files themselves sit centrally under `src/assets/media/` (alias `@media`), so Sveltia's media folder is global, not per-bundle.
