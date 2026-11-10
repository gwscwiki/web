# GW Speedclear (unofficial fansite)

Bilingual (French first, English second) knowledge base for Guild Wars 1 PvE speedclears. Astro + Starlight, static on GitHub Pages, edited through git or Sveltia CMS.

Domain vocabulary: [`CONTEXT.md`](CONTEXT.md). Architecture decisions: [`.scratch/gw-kb/map.md`](.scratch/gw-kb/map.md) and [`docs/adr/`](docs/adr/).

## Run

Node 24.

```sh
npm install
npm run dev            # http://localhost:4321  (editor: /admin/index.html, Chromium → "Work with Local Repository")
npm run check:content  # content rules the schema can't express (also run in CI)
npm run check:styles   # design-system rules: tokens only, no stray colors (also run in CI)
npm run icons:sync     # fetch icons for the IDs in use (runs before dev/build; GW_ICONS_OFFLINE=1 to skip)
npm run build          # fetches game data from build-wars at a pinned commit; cached in node_modules/.cache/gw-data
```

`SITE_URL` / `SITE_BASE` set the deploy URL and base path (repo name still open).

## Where things live

| What | Where |
|---|---|
| Pages (Zone, Strategy, Role, Duty, core, Build) | `src/content/docs/…` (French) and `src/content/docs/en/…` (English: title, summary, prose only) |
| Gear catalog, Gear sets, Consumables (no pages; link to the Guild Wars Wiki, [ADR 0003](docs/adr/0003-gear-and-consumables-without-pages.md)) | `src/content/gear/{weapons,runes,insignias}/`, `src/content/gear-sets/{armor,weapons}/`, `src/content/consumables/<kind>/` (YAML) |
| Skill nicknames | `src/content/skill-nicknames.yaml` |
| Strategy source notes | `.scratch/gw-kb/research/gwscr-fow-strategies.md` |
| Screenshots and loops | `src/assets/media/` (`@media/…`), `.fr`/`.en` suffix for per-locale overrides |
| Game icons | synced from the Guild Wars Wiki into `src/assets/icons/synced/` (gitignored); hand-picked overrides in `src/assets/icons/manual/<kind>/<id>` ([ADR 0002](docs/adr/0002-icons-from-gww-images.md)) |
| Design system | tokens and global styles in `src/styles/`, primitives in `src/components/ui/`, rules in [`docs/design-system.md`](docs/design-system.md), live reference at `/design-system/` |
| Prose blocks | `src/components/blocks/` (auto-imported: `<SkillBar code>`, `<BuildBar build>`, `<GearCard gear>`, `<DutyBadge duty>`, `<Loop src>`, `<YouTube id>`) |
| Generated cross-links per page type | `src/components/entity/EntityPanel.astro` |
| Game data loaders | `src/loaders/gw-data.ts`, pin in `src/lib/gw/source.mjs` |
