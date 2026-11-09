# Visual editor

Type: research
Status: resolved
Blocked by:

## Question

Which git-backed visual editor gives Notion-style block editing for this site, and what file formats does it impose? The site is Astro 7 + Starlight 0.42, a static site on GitHub Pages, FR root with EN under `/en/`. Needs:
- block editing of MDX prose with custom blocks: a bar block (template code or Build reference), a gear block (reference to a Gear entry), a duty badge, video loops
- forms for YAML/JSON data entries that reference each other (Build → Build core, Role → Build, Requirement → Zone/Role/Duty)
- paired FR/EN versions of the same entry
- image uploads into `src/`
- usable by the owner and by other players

Compare Keystatic, TinaCMS, Sveltia/Decap CMS and any other serious candidates on these points. Also cover the auth model (local mode, GitHub OAuth, hosted service), cost, maintenance health, and how well each fits Starlight's `docs` collection. The editor's formats constrain Storage mapping.

## Comments

Research findings: `research/visual-editor` branch → `.scratch/gw-kb/research/visual-editor.md`

## Answer

**Recommended: Sveltia CMS. Runner-up: Keystatic. Third: TinaCMS.** Not decided yet: confirming the editor is the first question for [Storage mapping](05-storage-mapping.md), since its formats drive the mapping. Ruled out: Decap, Pages CMS, CloudCannon, Front Matter and Static CMS (archived). None of the three candidates is blocked by Astro 7.4.7 or Starlight 0.42.10.

- **Sveltia CMS** (MIT, free, beta 0.262.x, one very active maintainer, 1.0 expected late 2026)
  - **Hosting:** a static admin in `public/admin/`, so it works on GitHub Pages as-is.
  - **Sign-in:** a personal access token, or GitHub OAuth through a small Cloudflare Worker relay. The owner can also edit a local clone with no sign-in (Chromium browsers only).
  - **Contributors:** players with a GitHub account can contribute without write access through Open Authoring: the editor forks the repo and their edits arrive as pull requests. That needs a public repo. Players without a GitHub account can't edit.
  - **FR/EN:** pairing is built in and matches Starlight's root-locale layout. The same filename sits under `src/content/docs/…` and `src/content/docs/en/…`, and both are edited side by side. EN can stay missing until translated.
  - **References:** a relation stores the target's slug, which matches Astro's `reference()`. A polymorphic target (Zone/Role/Duty) is stored as `{ type, … }`.
  - **Constraints:**
    - Blocks are matched by regex, not parsed as MDX, so they must be self-closing, one per line, with a fixed attribute layout.
    - No wrapper or nested components (`<Tabs>`, `<Aside>` with children); use `:::` asides.
    - No `import` lines; components are registered globally with `astro-auto-import`, listed after `starlight()`.
    - Set `omit_empty_optional_fields: true`.
    - Screenshots are only optimised when they sit in a page bundle (`<slug>/index.mdx` with the image beside it). *(Superseded by [Media conventions](04-media-conventions.md): media live centrally under the `@media` alias instead.)*
    - Rich-text mode normalises some Markdown syntax.
  - **Verified hands-on:** custom blocks become form blocks, and imports, unknown JSX, `:::` asides and images round-trip byte-identical. Where it writes files on disk comes from the docs; the test backend writes nothing.
- **Keystatic** (runner-up)
  - **Best block editor:** it parses MDX properly and has typed component schemas with relationship fields.
  - **Hosting:** the admin needs a server. `astro build` fails without an adapter (verified), so Pages would build with the integration skipped and editing would need a second, server-hosted deployment.
  - **FR/EN:** no pairing; FR and EN are separate collections whose slugs must match by hand.
  - **Strictness:**
    - Any frontmatter key missing from its schema, any `import`, raw HTML or unregistered component stops the entry from opening.
    - On save it escapes `:::` asides.
- **TinaCMS** (third)
  - **Hosting:** a static admin, but editing goes through TinaCloud (2 free users, then $24 per project per month).
  - **References:** stored as repo file paths, and lists of references aren't supported.
  - **Bodies:** an `import` line makes the body uneditable, and it escapes `:::`.
  - **FR/EN:** no pairing.
- **Applies to every editor:**
  - no `import` lines in editor-managed MDX (use `astro-auto-import`)
  - blocks written as JSX tags with string attributes
  - one YAML/JSON file per data entry, so Astro ids equal the editor's slugs
- **For the human (Storage mapping):**
  - confirm Sveltia
  - accept its risk (float the CDN script as the project advises, or self-host a pinned npm copy to keep the exact-pin policy)
  - contributor model: Open Authoring on a public repo, or write-access collaborators. Either way, only the owner can set up the OAuth app and Worker.
  - must players without a GitHub account be able to edit? If so, Sveltia is out.
  - block syntax discipline for editor-managed pages
  - one bar block with two optional attributes, or two blocks (`<SkillBar code>` / `<BuildBar build>`)
