# Skeleton prototype

Type: prototype
Status: resolved
Blocked by:

## Question

Does the architecture hold up when built? Scaffold the Starlight site with the decided collections and schemas, plus one sample page per content type (Build core, Build, Zone/Role, Duty, Gear, Consumable) in French with an English fallback, for the user to react to. This is executed work (see map Notes override). Verify the items [Starlight capabilities](02-starlight-capabilities.md) left open: `reference()` inside `docsSchema({ extend })`, priority of generated routes next to Starlight's `[...slug]`, and the fallback-search middleware. From [Skill & item data sources](01-skill-and-item-data-sources.md): run `@buildwars/gw-templates` at build time on Node 24 against a sample Build; render a French skill description with its grammar tags; include the unofficial-site title and the ArenaNet footer notice.

From [Content model](03-content-model.md):
- Use the real VoS core code `OgCjkirMrSmXfbaXNX3lcXsX5iA`, a v3 Build (stab → IAU) and a slot alternative (battle stand → Ebon Escape / Death's Charge, D/A), with placeholder Duties.
- Show swaps derived from the pasted code.
- Include a bar block from a raw code and a gear block in prose.
- Edit at least one page through the editor chosen in [Visual editor](08-visual-editor.md).

From [Visual editor](08-visual-editor.md), if Sveltia is chosen, prototype with its local-folder workflow:
- check the paths it actually writes for `{{locale}}` folders and `omit_default_locale_from_file_path`
- check that a `relation` inside an editor component writes the slug
- check `initial_locales` behaviour for FR-only entries
- check the OAuth Worker under the GitHub Pages `base` path

From [Media conventions](04-media-conventions.md):
- check that Sveltia writes `@media/…` paths with `media_folder: src/assets/media` and `public_folder: '@media'`
- build the `<Loop src="<stem>" />` component with its glob lookup, and check that a missing stem fails the build
- add the media CI check (size and dimension caps, unreferenced files) and the empty-alt build check
- include one shared screenshot rendered from both the FR and EN pages, plus one `.fr` override

From [Storage mapping](05-storage-mapping.md):
- build the build-time Astro loader (build-wars JSON at a pinned tag, filtered to the IDs used in content) and cache its data store in CI; nothing is synced or committed. This replaces the sync script from Skill & item data sources.
- check that `astro:assets` optimises remote GWW icons (`image.domains`)
- check that Sveltia saves non-i18n frontmatter fields only to the French file, and that the merge helper gives EN pages the shared fields
- check that `@buildwars/gw-templates` decodes a core code with empty slots
- add the CI checks: EN page with no French twin, a `skillNotes` skill missing from the code, one default Party setup per Zone, each Role/Duty in exactly one Zone, the block-syntax lint
- install `@sveltia/cms` exact-pinned and copy it into `public/admin/`
- optionally try `bun run build`

From [Information architecture](06-information-architecture.md):
- lay out content by the path table there (Zone at the root, `roles/` and `duties/` subfolders, Builds under their core, Gear and Consumables in type folders)
- build the sidebar at config time from the French Zone frontmatter (Roles and Duties in order) and check prev/next walks the run
- one Sveltia collection per Gear/Consumable folder, with gear type and consumable kind derived from the path; CI check that `kind` matches the path
- the rehype plugin that prefixes `base` and locale on root-path links, plus a links validator
- `<GearIndex />` with the Zone → Duty filter, and a Role page's "what to bring" list
- a Zone `runs` entry and a Duty `run` reference with a timestamp

## Answer

**The architecture holds up when built.** Skeleton on branch `skeleton`: Astro 7.4.8 + Starlight 0.42.10 (exact pins), `npm run dev` / `npm run build` (39 pages), `npm run check:content`, a GitHub Pages workflow and the Sveltia admin. See `README.md`.

**Verified by building**
- `reference('docs')` inside `docsSchema({ extend })` works, with the entity schema as a Zod discriminated union on `kind`. English twins (no `kind`) fall into a `kind: z.undefined().optional()` branch.
- No generated routes are needed (every entity is `docs` MDX), so route priority next to `[...slug]` is moot.
- Fallback-search middleware is unneeded: English fallbacks stay indexed (Information architecture). Pagefind builds `fr` and `en` indexes, 19 pages each.
- Build-time loaders (`src/loaders/gw-data.ts`) fetch build-wars JSON, keep only the IDs used (skills, mods, item bases), merge skill nicknames, and cache downloads in `node_modules/.cache/gw-data/<sha>` (cached in CI with Astro's data store).
- `@buildwars/gw-templates` on Node 24 decodes the VoS core, the IAU Build and a core code with empty slots (`OgCjkirMrOm3vNAo5CA4usXAAAAA`).
- Swaps are derived from the pasted code (Dwarven Stability (stab) → "I Am Unstoppable!" (IAU)). The slot alternative Death's Charge shows "D/A", derived from the skill's profession.
- French skill descriptions render with grammar tags resolved (`[f:"…"]` dropped, `[pl:"…"]` takes the plural) and `<gray>` styled.
- The merge helper (`src/lib/kb.ts`) gives English pages the French twin's shared fields. An English fallback page shows Starlight's notice. A French-only `{ fr, en }` note shows "not yet translated".
- Every cross-link from the Information architecture table renders. The sidebar is built from Zone frontmatter, and prev/next walks the run (ToC → griffs).
- Gear and Consumable indexes have the Zone → Duty / Role / level / type filters.
- Root-path prose links get the locale (`/fow/…` → `/en/fow/…` on English pages) and the base (`SITE_BASE=/gw-kb` built clean). `starlight-links-validator` fails the build on a dead link.
- `@media/x.webp` is optimised. The French page picks up `x.fr.webp` automatically, the English page gets the shared file. Empty alt text fails the build.
- `<Loop src>` with a missing stem fails the build.
- `scripts/check-content.mjs` was negative-tested on every rule it enforces. It covers:
  - an English page with no French twin
  - shared fields placed in an English file
  - `kind` not matching the path, or an unknown Gear/Consumable folder
  - a Role or Duty not listed by exactly one Zone
  - a `skillNotes` skill missing from the code
  - more or fewer than one default setup per Zone
  - a nickname for an unused skill
  - block syntax: self-closing, string attributes, one per line, no imports
  - media caps and unreferenced media
- The unofficial-site title and the verbatim ArenaNet footer notice are on every page.
- `bun run build` works as a script runner.

**Corrections to earlier tickets**
- **build-wars pin is a commit, not a tag.** Tag 2.1.0 has skill data but no `moddata.json` / `itemdata.json`; those exist only on `main`. Pinned to `8495ca2` in `src/lib/gw/source.ts`.
- **GWW blocks automated downloads** (HTTP 403 to scripts), so `astro:assets` can't fetch skill icons from it during the build, and build-wars publishes no icons. The skill bar reads local `src/assets/skill-icons/<id>.*` and shows a placeholder tile until icons exist. **Open decision:** how icons get into the repo (e.g. downloaded by hand from GWW in a browser and committed: about 64×64 px, a few KB each, only for skills in use).
- **Astro 7 defaults to the Sätteri Markdown processor.** Remark/rehype plugins need `markdown.processor: unified({…})` from `@astrojs/markdown-remark` (now a dependency). `astro-auto-import` must stay **after** `starlight()`, because it skips itself if MDX isn't registered yet. Its order warning is harmless with `unified` (checked in dev and build).
- **YAML:** French game names contain `: `, so hand-written titles need quotes (Sveltia quotes automatically).
- **Profession and attribute names** aren't in any game-data source. They are hand-entered in `src/lib/gw/names.ts`. Official mod strings confirm *Maîtrise de la faux*, *Prières de la Terre* and *Mysticisme*; the other French names need checking against GWiki.fr.

**Still to check by hand in Sveltia** (needs a Chromium browser: `npm run dev`, open `/admin/index.html`, choose "Work with Local Repository")
- Edit one page and confirm the paths written for `{{locale}}` folders with `omit_default_locale_from_file_path`.
- Confirm shared (`i18n: false`) fields stay out of the English file.
- Confirm `initial_locales: default` lets an entry stay French-only.
- Confirm relations with a prefixed `value_field` (`fow/roles/{{slug}}`) write the full docs id. This is the same question for relations inside editor components (`<BuildBar>`, `<DutyBadge>`). The bundle code suggests it works, but it hasn't been run.
- Confirm media uploads write `@media/…`.
- Confirm the blocks round-trip unchanged through the rich-text editor.
- OAuth Worker under the Pages `base`: needs the repo and Worker to exist (the repo name is still open).

**Known skeleton limits**
- Sveltia needs one collection per Zone for Roles and Duties, and one per core for Builds (`fow-roles`, `vos-builds`). Each new Zone or core adds collections to `public/admin/config.yml`.
- The gear block in the editor only offers runes, because a relation targets one collection.
- No sample loop file, since there is no ffmpeg here. The component and its failure mode are tested; a real clip is needed to see playback.
- The YouTube ID and the Zone's French in-game name are placeholders.
