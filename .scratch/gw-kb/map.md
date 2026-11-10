# GW Knowledge Base — architecture

Labels: wayfinder:map

## Destination

An architecture spec plus a working FR-first/EN Starlight skeleton (content collections, schemas, one sample page per content type), ready for a dedicated session that writes the real VoS Dervish content.

## Notes

- **Domain:** Guild Wars 1 PvE speedclears. Read `CONTEXT.md` (repo root) and use its vocabulary: Zone, Build core, Build, Role, Duty, Party setup, Gear, Consumable, Requirement.
- **Skills:** default to `grilling` + `domain-modeling`; research tickets use `research`.
- **Language:** code and identifiers in English; content written **French first**, English second.
- **Stack:** Astro + Starlight (customised with components); public site on GitHub Pages; edited via git.
- **Execution override:** the skeleton prototype ticket may scaffold real code — that skeleton is part of the destination.
- **Settled during charting** (don't re-litigate):
  - Model is build-agnostic; VoS is just the first content.
  - Build core is a first-class concept; a zone Build = core + slot swaps.
  - Requirement = level (required / recommended / optional) × target (Zone, Role, or Duty); applies to Gear and Consumables alike.
  - Gear = weapons, weapon sets, armor pieces, runes/insignias. Consumables are a separate collection sharing the Requirement model. PvE skills belong to the Build.
  - Want skill icons, skill data, template codes, French skill names.
  - i18n: prose translated, structured data shared; missing translation falls back to the other locale with a "not yet translated" banner. (Starlight only does FR→EN natively; Storage mapping settled the reverse with a French-first rule plus a CI check.)
  - Media: YouTube for full runs, short self-hosted loops for single-Duty clips, screenshots in repo via Astro image optimisation.
  - Navigation: zone-first sidebar + index pages (Gear, Duties, Consumables) filterable by Duty label.
  - Party setups are modelled now (a Role's Duties vary by setup); setup pages come later.

## Decisions so far

<!-- one line per closed ticket: [title](issues/NN-slug.md): gist -->

- [Starlight capabilities](issues/02-starlight-capabilities.md): stay on Starlight 0.42 / Astro 7 (pinned). FR root is native; fallback is built in only one way (EN visitors see French), so EN-only pages would 404 in French. Data collections + `<StarlightPage>` cover generated pages.
- [Skill & item data sources](issues/01-skill-and-item-data-sources.md): key by game ID; build-wars JSON gives official EN+FR skill and rune/insignia strings, filtered to IDs in use (storage superseded by Storage mapping); `@buildwars/gw-templates` for codes; consumables are a hand-kept list. ArenaNet policy: unofficial label, footer notice, never translate game text.
- [Content model](issues/03-content-model.md): a Build is a core reference plus its own pasted template code, and swaps are derived. A core fixes 1–8 skills. Roles are stable per Zone, each running one Build (Builds can be shared). Party setups assign Duties. A Loadout says what is worn, Requirements how necessary it is. Prose has bar and gear blocks. Labels stay English; game text comes from data.
- [Visual editor](issues/08-visual-editor.md): Sveltia CMS recommended (static admin on Pages, built-in FR/EN pairing matching Starlight, slug references, Open Authoring for players with GitHub accounts); Keystatic needs a server, Tina needs TinaCloud. Constraints: self-closing one-line blocks, no MDX imports, page bundles for optimised screenshots. Final pick goes to Storage mapping.
- [Media conventions](issues/04-media-conventions.md): one central `src/assets/media/` behind the `@media` alias, shared across locales (`.fr`/`.en` suffix for rare overrides); plain Markdown screenshots with required alt; `<Loop src>` resolved by glob (VP9+H.264, ≤2 MB each); lite YouTube embeds, run videos as Zone data; immutable kebab-case names; size caps in CI, no LFS.
- [Storage mapping](issues/05-storage-mapping.md): Sveltia confirmed (exact-pinned npm, Open Authoring plus trusted editors). Game data is fetched during the build by an Astro loader at a pinned build-wars tag, filtered to IDs in use, never committed. Every page entity is `docs` MDX typed by `kind`; shared fields live only in the French file's frontmatter (ADR 0001), with `{ fr, en }` for nested strings. French-first CI check. Party setups and nicknames are YAML. Cores and Builds are template codes; notes are keyed by skill ID. `<SkillBar code>` / `<BuildBar build>`.
- [Information architecture](issues/06-information-architecture.md): one English path per entity, shared by both locales: Zones at the root (`/fow/`, `/fow/roles/v1/`, `/fow/duties/griffs/`), Builds under their core (`/builds/vos/iau/`), Gear and Consumables in type folders that replace the type field. The sidebar is built from Zone frontmatter (run order). Gear/Consumables/Builds have index pages; the Duty filter matches the Duty or its Zone. Cross-links are generated per page type. English fallbacks stay searchable. Root-path links get base and locale from a rehype plugin.
- [Skeleton prototype](issues/07-skeleton-prototype.md): the architecture holds up. Starlight skeleton on branch `skeleton` builds (39 pages) with sample pages for every kind, the build-time game-data loaders, generated cross-links, the content checks and the Pages workflow. Corrections: build-wars is pinned to a commit (mod/item data are not in the 2.1.0 tag); GWW blocks automated icon downloads, so icons are local files (placeholder until added); Astro 7 needs the `unified` processor for our remark/rehype plugins. The Sveltia editor checks still need a browser.

## Not yet specified

- Skill icons: GWW refuses automated downloads, so decide how icons reach `src/assets/skill-icons/` (e.g. downloaded by hand and committed).
- French names for professions and attributes are hand-entered in `src/lib/gw/names.ts`; check them against GWiki.fr.
- Repo name and base path (the deploy pipeline itself is known; see Starlight capabilities). The link convention is settled (Information architecture), so this no longer blocks content.
- Annotated route maps (e.g. griffs pull path) — format and tooling.
- Visual design of skill bar, gear card, duty badge components. French players use English labels and game vocabulary, so decide whether French pages show the English skill name next to the official French one, and where skill nicknames appear.
- Detailed filter/search UX on index pages.
- Contribution workflow (PR template, content checklist) for other players. Contributors use Open Authoring (fork + pull request), and a few trusted players get write access (see Storage mapping), so this is mostly the PR template, content checklist and review rules.
- SEO and social previews.

## Out of scope

- Writing the real VoS content — the dedicated content session after this map.
- Party setup pages (4-man, 5-man, beachway…) — model anticipates them, pages come later.
- Builds other than VoS.
