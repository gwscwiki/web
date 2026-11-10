# GW Speedclear (unofficial fansite)

Bilingual (French first, English second) knowledge base for Guild Wars 1 PvE speedclears. Astro + Starlight, static on GitHub Pages, edited through git or Sveltia CMS.

Domain vocabulary: [`CONTEXT.md`](CONTEXT.md). Architecture decisions: [`.scratch/gw-kb/map.md`](.scratch/gw-kb/map.md) and [`docs/adr/`](docs/adr/).

## Run

Node 24.

```sh
npm install
npm run dev            # http://localhost:4321  (editor: /admin/index.html, Chromium → "Work with Local Repository")
npm run check:content  # content rules the schema can't express (also run in CI)
npm run build          # fetches game data from build-wars at a pinned commit; cached in node_modules/.cache/gw-data
```

`SITE_URL` / `SITE_BASE` set the deploy URL and base path (repo name still open).

## Where things live

| What | Where |
|---|---|
| Pages (Zone, Role, Duty, core, Build, Gear, Consumable) | `src/content/docs/…` (French) and `src/content/docs/en/…` (English: title, summary, prose only) |
| Party setups, skill nicknames | `src/content/party-setups/*.yaml`, `src/content/skill-nicknames.yaml` |
| Screenshots and loops | `src/assets/media/` (`@media/…`), `.fr`/`.en` suffix for per-locale overrides |
| Skill icons | `src/assets/skill-icons/<skill id>.{jpg,png,webp}` (placeholder tile when missing) |
| Prose blocks | `src/components/blocks/` (auto-imported: `<SkillBar code>`, `<BuildBar build>`, `<GearCard gear>`, `<DutyBadge duty>`, `<Loop src>`, `<YouTube id>`) |
| Generated cross-links per page type | `src/components/entity/EntityPanel.astro` |
| Game data loaders | `src/loaders/gw-data.ts`, pin in `src/lib/gw/source.ts` |
