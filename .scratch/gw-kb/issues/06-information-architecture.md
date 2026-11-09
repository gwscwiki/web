# Information architecture

Type: grilling
Status: open
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
