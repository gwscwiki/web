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
  - i18n: prose translated, structured data shared; missing translation falls back to the other locale with a "not yet translated" banner. (Starlight only does FR→EN natively; Storage mapping decides the reverse.)
  - Media: YouTube for full runs, short self-hosted loops for single-Duty clips, screenshots in repo via Astro image optimisation.
  - Navigation: zone-first sidebar + index pages (Gear, Duties, Consumables) filterable by Duty label.
  - Party setups are modelled now (a Role's Duties vary by setup); setup pages come later.

## Decisions so far

<!-- one line per closed ticket: [title](issues/NN-slug.md): gist -->

- [Starlight capabilities](issues/02-starlight-capabilities.md): stay on Starlight 0.42 / Astro 7 (pinned). FR root is native; fallback is built in only one way (EN visitors see French), so EN-only pages would 404 in French. Data collections + `<StarlightPage>` cover generated pages.
- [Skill & item data sources](issues/01-skill-and-item-data-sources.md): key by game ID; build-wars JSON gives official EN+FR skill and rune/insignia strings, synced and filtered into the repo; `@buildwars/gw-templates` for codes; GWW icons stored locally; consumables are a hand-kept list. ArenaNet policy: unofficial label, footer notice, never translate game text.
- [Content model](issues/03-content-model.md): a Build is a core reference plus its own pasted template code, and swaps are derived. A core fixes 1–8 skills. Roles are stable per Zone, each running one Build (Builds can be shared). Party setups assign Duties. A Loadout says what is worn, Requirements how necessary it is. Prose has bar and gear blocks. Labels stay English; game text comes from data.
- [Visual editor](issues/08-visual-editor.md): Sveltia CMS recommended (static admin on Pages, built-in FR/EN pairing matching Starlight, slug references, Open Authoring for players with GitHub accounts); Keystatic needs a server, Tina needs TinaCloud. Constraints: self-closing one-line blocks, no MDX imports, page bundles for optimised screenshots. Final pick goes to Storage mapping.
- [Media conventions](issues/04-media-conventions.md): one central `src/assets/media/` behind the `@media` alias, shared across locales (`.fr`/`.en` suffix for rare overrides); plain Markdown screenshots with required alt; `<Loop src>` resolved by glob (VP9+H.264, ≤2 MB each); lite YouTube embeds, run videos as Zone data; immutable kebab-case names; size caps in CI, no LFS.

## Not yet specified

- Repo name and base path (the deploy pipeline itself is known; see Starlight capabilities). `base` isn't applied to hand-written MDX links, so this probably also needs a link convention.
- Annotated route maps (e.g. griffs pull path) — format and tooling.
- Visual design of skill bar, gear card, duty badge components. French players use English labels and game vocabulary, so decide whether French pages show the English skill name next to the official French one, and where skill nicknames appear.
- Detailed filter/search UX on index pages.
- Contribution workflow (PR template, content checklist) for other players. With Sveltia, players with a GitHub account would contribute through Open Authoring (fork + pull request), so this is mostly the PR template, content checklist and review rules.
- SEO and social previews.

## Out of scope

- Writing the real VoS content — the dedicated content session after this map.
- Party setup pages (4-man, 5-man, beachway…) — model anticipates them, pages come later.
- Builds other than VoS.
