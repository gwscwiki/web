# Media conventions

Type: grilling
Status: resolved
Blocked by:

## Question

Where do videos, short loops and screenshots live in the repo, how are they named, and how does a Duty (or Build/Gear) page reference them? What formats and size limits apply to self-hosted loops? Are media shared between locales or per-locale (e.g. screenshots with French UI)?

From [Visual editor](08-visual-editor.md): with Sveltia (recommended), screenshots are only optimised by Astro if they sit in a page bundle next to the page (`<slug>/index.mdx` with the image beside it). An image uploaded in one locale is saved in that locale's bundle, and a shared image stored once in the FR bundle won't resolve from the EN page. Decide how this fits the per-locale vs shared screenshot question.

## Answer

**Media live in one central folder (`src/assets/media/`, alias `@media`) and are shared across locales by default.** This replaces the page-bundle constraint from [Visual editor](08-visual-editor.md).

- **Location:** every self-hosted file goes in `src/assets/media/`, referenced as `@media/…` from MDX (`![alt](@media/x.webp)`) and from data `image()` fields.
  - Sveltia's media folder is set to `src/assets/media` and its path setting to `@media`. Sveltia keeps `@`-prefixed values as written, but `~/…` would become `/~/…`.
  - Verified in a throwaway Astro 7.4.8 / Starlight 0.42.10 build with `base`: alias paths are optimised in MDX and in YAML `image()` fields. `/src/...` absolute paths are **not** (they come out as a raw broken `<img>`).
  - Sveltia writing `@media` paths was read in its source code, not run. Verify in the skeleton.
- **Locale:**
  - Screenshots are shared by default, captured in the English client (players use English game vocabulary anyway).
  - A per-locale override is a sibling file with a locale suffix: `tooltip.fr.webp`.
  - Alt text and captions are prose, so each locale writes its own.
- **Naming:**
  - Lower-case kebab-case English, named after what the media shows, prefixed with the Zone where useful (`fow-griffs-pull`).
  - Immutable once published: a changed file gets a new name.
  - A loop's encodings and poster share a stem: `x.webm`, `x.mp4`, `x.poster.webp`.
- **Screenshots:**
  - Plain Markdown images, optimised by Astro to responsive WebP.
  - Source PNG/WebP, cropped, at most 1920 px wide and at most 1 MB.
  - Capture at the default UI size.
  - Alt text is required; a build check fails on an empty one.
  - A caption is an italic paragraph after the image. No `<Shot>` component unless captions prove necessary.
- **Loops (single-Duty clips):**
  - Block `<Loop src="<stem>" />`. The component resolves the stem through `import.meta.glob('/src/assets/media/**/*.{webm,mp4,webp}', { eager, query: '?url', import: 'default' })`.
  - A missing loop fails the build. Files are hashed and get the base path.
  - Vite inlines files under 4 KB as data URIs, which is harmless at real sizes.
  - Encoding:
    - no audio
    - 3–15 s
    - at most 720p and 30 fps
    - WebM (VP9) plus MP4 (H.264), each at most 2 MB
    - a WebP poster
  - Playback: `autoplay muted loop playsinline`, lazy-loaded below the fold.
- **YouTube:**
  - Lite facade via `youtube-nocookie` (e.g. `@astro-community/astro-embed-youtube`) as `<YouTube id="…" start="…" />`.
  - Full-run videos are **structured data on the Zone**, a list of runs:
    - url
    - Party setup
    - date
    - runner
    - commentary language
  - A Duty with no loop may reference a run plus a timestamp. Inline `<YouTube>` blocks are still allowed for ad-hoc embeds.
- **Budget and CI:**
  - One CI check enforces the size and dimension caps, flags media nothing references, and fails on empty alt text.
  - No Git LFS: Pages builds would need `lfs: true`, and Actions downloads eat the 10 GiB free quota.
  - GitHub limits: the repo and the published Pages site should both stay at or under 1 GB, and GitHub blocks files over 100 MiB.
  - About 4 MB per loop means about 100 loops is about 400 MB, and replaced files stay in history. Revisit external hosting if loops grow well past about 100.
- **Handed on:**
  - [Storage mapping](05-storage-mapping.md): where the Zone run-video data lives.
  - [Skeleton prototype](07-skeleton-prototype.md):
    - Sveltia writing `@media` paths
    - the `<Loop>` glob lookup
    - the alt-text build check
