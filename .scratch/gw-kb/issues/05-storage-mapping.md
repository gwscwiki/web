# Storage mapping

Type: grilling
Status: resolved
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

## Comments

Superseded in part by [Information architecture](06-information-architecture.md): Gear `gearType` and the Consumable `kind` are dropped from frontmatter and derived from the type folder (`gear/runes/…`, `consumables/cons/…`). Zone run videos are `runs` on the Zone and `run: { id, at }` on the Duty.

## Answer

Settled in a grilling session with the user (three rounds). ADR: [`docs/adr/0001-shared-data-in-french-frontmatter.md`](../../../docs/adr/0001-shared-data-in-french-frontmatter.md).

**Editor**
- **Sveltia CMS** confirmed. Players without a GitHub account can't edit; they send corrections another way.
- **Pinned:** `@sveltia/cms` is an exact-pinned npm dependency whose bundle is copied into `public/admin/` at build. Not the floating CDN script. Dependabot opens bump PRs.
- **Contributors:** public repo with Open Authoring (fork + PR) for any player, plus write access for a few trusted editors. The owner sets up the OAuth app and the Cloudflare Worker.

**Game data** (supersedes the "synced and committed" storage from [Skill & item data sources](01-skill-and-item-data-sources.md))
- **Fetched online at build, nothing committed.** No `sync-gw-data` script and no `src/data/gw/`.
- **Skills and mods:** a custom Astro content loader fetches the build-wars JSON at a **pinned tag** (raw GitHub URL, one constant) during `astro build`. It scans content for the skill and mod IDs actually used (template codes, alternatives, bar blocks, Gear `modId`s) and keeps only those, so no data dump ever sits in the repo. Exposed as read-only `skills` and `mods` collections. Switch to npm once French is published there.
- **Icons:** pages reference GWW icon URLs; `astro:assets` downloads and optimises them during the build (`image.domains: ['wiki.guildwars.com']`). Never hotlinked.
- **Accepted risk:** if GitHub or GWW is down, that deploy fails and the previous version stays live. Cache Astro's data store in CI.
- **Consumable French names** stay hand-written (`nameFr`).
- **Runtime:** Node 24 in CI. Bun is fine as package manager and script runner; the skeleton may try `bun run build` before Bun becomes the runtime.

**Skill nicknames:** one authored list, `src/content/skill-nicknames.yaml` (`{ skill: <id>, nickname }`), a Sveltia file collection. The `skills` loader merges it in. CI checks each ID is used.

**Docs vs data**
- **Every entity with a page is `docs` MDX:** Zone, Role, Duty, Build core, Build, Gear, Consumable. Its type is a required, non-translated **`kind`** field (`zone | role | duty | build | core | gear | consumable`), checked as a Zod discriminated union inside `docsSchema({ extend })`. Paths and URLs are left to [Information architecture](06-information-architecture.md). Plain pages have no `kind`.
- **Shared structured fields live only in the French (root) file's frontmatter.** They are non-i18n fields in Sveltia, saved only to the default locale. The EN twin holds only the title, description/summary and body. A helper merges the French twin's shared fields into EN pages.
- **YAML data collections** only for things without pages: `skill-nicknames`, `party-setups`.

**i18n and fallback**
- **Pages:** French-first rule. A CI check fails the build when a `src/content/docs/en/**` file has no French twin. A missing EN page falls back to French through Starlight's `isFallback`, with the overridable `FallbackContentNotice` banner.
- **Translated strings inside structured data** (slot notes, alternative notes, Requirement reasons) are `{ fr, en }` objects: `z.object({ fr: z.string(), en: z.string().optional() })`. A missing `en` renders the French text with the "not yet translated" marker.

**Entity mapping** (frontmatter of the French file)
- **Zone:** ordered `roles: [ref]` and `duties: [ref]`. List order is run order (drag-sortable in Sveltia). Roles and Duties don't store their Zone; it is derived. CI: each Role and Duty sits in exactly one Zone.
- **Role:** `label` (shared, English), `build: ref`.
- **Duty:** `label` (shared, English).
- **Party setup:** YAML data, one file per setup (`party-setups/fow-5man.yaml`): `zone`, `label`, `default`, `roles: [{ role, duties: [ref] }]`. CI: exactly one default per Zone. Moves to docs when setup pages arrive.
- **Build core:** `code`, a template code where open slots are empty (skill ID 0) and an open secondary has no profession. Fixed skills, professions and attributes are derived from it. Plus `loadout`.
- **Build:** `core: ref`, `code` (pasted, tested in game), `loadout` (partial override), and `skillNotes` keyed by **skill ID**, not slot position: `[{ skill, note: {fr,en}, alternatives: [{ skill, note: {fr,en} }] }]`. CI: every `skill` in `skillNotes` is in the code. Swaps, filled slots, secondary and attributes are derived.
- **Loadout:** `weaponSets: [{ id, weapons: [ref] }]` and `armor.{head,chest,hands,legs,feet}: { insignia: ref, rune: ref, attribute? (head) }`. Every Gear item is a reference to a Gear page. A Build's Loadout is merged with the core's: armor per slot and field, weapon sets matched by `id` and replaced whole, absent fields inherited (`omit_empty_optional_fields: true`). A Build can't remove a core weapon set (accepted gap).
- **Gear:** `gearType: weapon | weaponSet | rune | insignia`, plus one identity: `modId` (rune/insignia), `base` + `mods: [modId]` (weapon), or `gwwTitle` (named PvE item). Plus `requirements`.
- **Consumable:** `gwwTitle`, `nameFr` (hand-checked), `kind` (`cons | summoning-stones | powerstones | sweets-alcohol | other`), `requirements`.
- **Requirement:** Sveltia typed-object list: `{ level: required|recommended|optional, target: { type: zone|role|duty, <type>: ref }, reason?: {fr,en} }`. Duty targets are the authoring default.

**Blocks in prose**
- `<SkillBar code="…" />` (display only, not a Build) and `<BuildBar build="…" />` (relation): two blocks, not one.
- A gear block referencing a Gear entry, plus the duty badge and `<Loop src />`.
- **Discipline:** all are self-closing, one per line, with string attributes. No `import` lines (components registered through `astro-auto-import` after `starlight()`). No wrapper components; use `:::` asides. A CI lint step enforces this; the home page is allowlisted for Starlight's hero and card grid.

**For [Skeleton prototype](07-skeleton-prototype.md) to verify:** Sveltia keeps non-i18n fields out of the EN file; `reference('docs')` works in the extended schema; `@buildwars/gw-templates` decodes a code with empty slots; `astro:assets` optimises remote GWW icons; the build-time loader and its CI cache; optionally `bun run build`.

**For [Information architecture](06-information-architecture.md):** file paths and URLs per `kind`; whether EN fallback pages are kept out of the English search index.

From [Media conventions](04-media-conventions.md): full-run videos are structured data on the Zone (url, Party setup, date, runner, commentary language), and a Duty may reference a run plus a timestamp. Decide where that data lives and how the Duty reference is stored. Media files themselves sit centrally under `src/assets/media/` (alias `@media`), so Sveltia's media folder is global, not per-bundle.
