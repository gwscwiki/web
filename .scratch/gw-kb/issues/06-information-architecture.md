# Information architecture

Type: grilling
Status: resolved
Assignee: krumpyzoid
Blocked by: 03, 05

## Question

What is the URL scheme (FR root, `/en/`), the sidebar shape (zone-first), and the set of index pages (Gear, Duties, Consumables, Build cores)? How does filtering by Duty label work, and which cross-links does each page type show (e.g. Gear page lists its Requirements; Duty page lists Roles that carry it per Party setup)? Should French-only fallback pages appear in English search results (see [Starlight capabilities](02-starlight-capabilities.md))?

From [Content model](03-content-model.md):
- Builds stand on their own and are shared across Roles and Zones, so decide whether Builds get their own pages and index (each page lists the Roles that run it).
- A Gear page shows "worn by" (Loadouts) plus its Requirements.
- Consumables have kinds (a possible filter).
- Zone pages list Duties in run order and the default Party setup.

From [Storage mapping](05-storage-mapping.md):
- Every page entity is `docs` MDX typed by a `kind` field, so paths aren't constrained by schemas. Decide the folder and URL for each `kind` (e.g. Roles and Duties nested under their Zone; Builds and cores standalone, since Builds are shared across Zones).
- References are by docs id (the path), so choose paths that won't need moving.
- Party setups are YAML data with no pages yet; the Zone page shows the default one.
- Decide whether EN fallback pages are kept out of the English search index (`pagefind = false`).

## Answer

Settled in a grilling session with the user (two rounds).

**URLs and folders**
- One path per entity, shared by both locales (Starlight pairs `x.mdx` with `en/x.mdx`). Segments are English. The path is the docs id and therefore the reference id, so slugs are chosen not to move.

| Kind | File | URL |
|---|---|---|
| Zone | `fow/index.mdx` | `/fow/` — community abbreviation, at the root |
| Role | `fow/roles/v1.mdx` | `/fow/roles/v1/` |
| Duty | `fow/duties/griffs.mdx` | `/fow/duties/griffs/` |
| Build core | `builds/vos/index.mdx` | `/builds/vos/` |
| Build | `builds/vos/iau.mdx` | `/builds/vos/iau/` — named after what sets it apart, never a Role or Zone |
| Gear | `gear/{weapons,weapon-sets,runes,insignias}/<slug>.mdx` | `/gear/runes/superior-vigor-rune/` |
| Consumable | `consumables/{cons,summoning-stones,powerstones,sweets-alcohol,other}/<slug>.mdx` | `/consumables/cons/essence-of-celerity/` |

- Role and Duty slugs are their label in kebab-case (`v1`, `toc`, `360`). Gear and Consumable slugs are the English in-game name in kebab-case.
- Builds nest under their core because a Build never changes core; the core page doubles as the family's index.
- **Gear type and Consumable kind come from the folder.** `gearType` (Storage mapping) and the Consumable `kind` are dropped from frontmatter. Each folder is its own Sveltia collection, so a rune form shows only `modId` and a weapon form only `base` + `mods`.
- The entity `kind` field stays (Storage mapping). A CI check verifies it matches the path.
- Top-level sections (`builds`, `gear`, `consumables`, `about`) can't collide with Zone folders.

**Sidebar**
- One group per Zone (Zone order hand-set in config): Overview (the Zone page), Roles in the Zone's `roles` order, Duties in run order (`duties`). Built at config time from the French Zone frontmatter, so run order has one source and no `sidebar.order` copies. Starlight's prev/next then walks the run.
- A Builds group: each core with its Builds nested.
- Gear and Consumables appear as links to their index pages only; items aren't listed.
- Then `/about/`.

**Index pages**
- Each is an `index.mdx` holding one block, so it keeps fallback, search and sidebar: `/gear/` → `<GearIndex />`, `/consumables/` → `<ConsumableIndex />`, `/builds/` → `<BuildIndex />` (cores, their Builds, and the Roles running each).
- No global Duties index yet (the Zone page lists its Duties); add one when there are several Zones.
- No per-type index pages; `/gear/runes/` 404s and `/gear/` filters by type.

**Duty filter** (on the Gear and Consumables indexes)
- Zone → Duty picker. A Duty matches items whose Requirements target that Duty **or its whole Zone**.
- Role is a separate filter (Role targets aren't pulled in through Party setups). Also filter by Requirement level and by type/kind.
- A small client script over JSON embedded in the page, not Pagefind. Detailed UX stays on the map.

**Cross-links** (all generated from data)

| Page | Shows |
|---|---|
| Zone | Roles with their Build; the default Party setup as a Role × Duties table; Duties in run order; run videos; Gear/Consumables whose Requirements target the Zone |
| Role | Its Build (bar block + merged Loadout); Duties carried in the default setup, then differences in other setups; **what to bring**: Requirements targeting the Role plus those targeting its Duties (through the default setup), grouped by level, each labelled with its source |
| Duty | Prev/next in run order; which Role carries it per Party setup; Gear/Consumables targeting it; its loop, or the run video at its timestamp |
| Build | Its core; bar with swaps highlighted; slot notes and alternatives; merged Loadout; Roles running it, with their Zones |
| Build core | Bar and Loadout; its Builds with their swaps and the Roles running them |
| Gear | Worn by (cores and Builds whose Loadout includes it); Requirements grouped by level, linked to their targets |
| Consumable | Requirements grouped by level |

**Search:** English fallback pages stay in the English Pagefind index (no `pagefind = false` middleware). They aren't duplicates there, and early on hiding them would empty English search. Revisit once most pages are translated.

**Run videos** (left open by [Media conventions](04-media-conventions.md) and Storage mapping)
- Zone French frontmatter: `runs: [{ id, youtube, setup: ref, date, runner, lang }]`, `id` a short slug such as `2026-10-5man`.
- Duty: `run: { id, at: "4:12" }`, resolved against its Zone's runs. The Duty page embeds that run at the timestamp (lite YouTube) when it has no `<Loop>`.

**Links in prose:** authors write locale-free root paths (`/fow/duties/griffs/`). A rehype plugin prefixes `base` and the current locale; a links validator (e.g. `starlight-links-validator`) fails the build on dead links. This works whatever the repo name or domain becomes, so that stays open. Most cross-links are generated, so hand-written links should be rare.

**Home and fixed pages:** `/` is a Starlight splash page (unofficial-site notice, one card per Zone, links to Builds, Gear, Consumables). `/about/` covers the project, ArenaNet credits and how to send corrections; the contribution workflow itself stays on the map.

**For [Skeleton prototype](07-skeleton-prototype.md):** the config-time sidebar from Zone frontmatter; the rehype link plugin plus links validator; the `kind`-matches-path check; one Sveltia collection per Gear/Consumable folder with type derived from the path; Zone `runs` and Duty `run`.
