# Game icons are fetched from Guild Wars Wiki image files at build time

Skill, rune, insignia, weapon-component, inscription and consumable icons are downloaded during `dev`/`build` by `scripts/sync-icons.mjs`. Only the icons the content uses are fetched. They come straight from `wiki.guildwars.com/images/<md5 path>/<file>`, with the file name derived from build-wars data (English name plus a few small tables) and the path computed locally, so we never call the wiki API. Downloads are cached in `node_modules/.cache/gw-icons` and never committed. Weapon and armour bases have no wiki icon convention, so they come from a committed `src/assets/icons/manual/` folder, which also overrides any synced icon.

This replaces the skeleton's assumption that GWW blocks scripted downloads. That 403 no longer happens with a descriptive User-Agent (verified 2026-11-10, `.scratch/gw-kb/research/icon-sources.md`).

## Considered options

- **Commit an ID-keyed skill set from pvxcode / gwbbcode** (what next-guild does): zero name mapping, but skills only, frozen since 2020, missing 2026 skills. It would also mean committing a large asset set we mostly don't use. Kept as a possible fallback for skills.
- **Copy GW Market's hand-collected files:** no licence on that repo.
- **Hotlink GWW at runtime:** puts our traffic on the wiki and breaks offline/preview builds.
- **The GWW API (`imageinfo`, `Game link:Skill`):** `robots.txt` disallows `api.php`, and it intermittently returns cached 503s.

## Consequences

- A build needs network access only for icons not yet cached. Misses never fail the build; they show a placeholder and a warning.
- Fetching only what pages use keeps us within the ArenaNet Content Use Policy (no standalone asset dumps). Don't add a "download everything" mode.
- If GWW renames files or starts refusing scripts, the fix is a mapping table entry or a manual drop-in, not a code change.
- The inscription item-class → icon mapping is inferred. Check it by eye when the first inscription appears in content.
