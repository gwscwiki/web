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
  - i18n: prose translated, structured data shared; missing translation falls back to the other locale with a "not yet translated" banner.
  - Media: YouTube for full runs, short self-hosted loops for single-Duty clips, screenshots in repo via Astro image optimisation.
  - Navigation: zone-first sidebar + index pages (Gear, Duties, Consumables) filterable by Duty label.
  - Party setups are modelled now (a Role's Duties vary by setup); setup pages come later.

## Decisions so far

<!-- one line per closed ticket: [title](issues/NN-slug.md): gist -->

## Not yet specified

- GitHub Pages deploy pipeline, repo name, base path.
- Annotated route maps (e.g. griffs pull path) — format and tooling.
- Visual design of skill bar, gear card, duty badge components.
- Detailed filter/search UX on index pages.
- Contribution workflow (PR template, content checklist) for other players.
- SEO and social previews.

## Out of scope

- Writing the real VoS content — the dedicated content session after this map.
- Party setup pages (4-man, 5-man, beachway…) — model anticipates them, pages come later.
- Builds other than VoS.
