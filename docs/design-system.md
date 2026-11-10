# Design system

How the site looks and how to change it without breaking it. Live reference: **`/design-system/`** (all tokens and components, both themes).

## Direction

- **Dark first.** Light is opt-in through the header switch (`overrides/ThemeSelect.astro`, stored under Starlight's `starlight-theme` key). The OS preference is ignored on purpose.
- **Teal-tinted grays**, a **teal accent**, and four pairings for meaning: **green** (success), **blue** (info), **cherry** (danger), **orange** (warning, elite skills).
- **Flat.** No gradients. One glow, on elite skill icons only.
- **Fantasy details**: corner brackets on panels, ruled dividers with a diamond centrepiece, diamond heading marks, the site sigil, a line-art skyline on the home hero, and **Cinzel** for display text. Body text stays a readable system sans.

## Layers

Styles live in `src/styles/`, loaded in this order by `customCss` in `astro.config.mjs`:

| Layer | File | Holds | May use |
|---|---|---|---|
| 1. Primitives | `tokens.css` | raw palette (`--gw-gray-900`, `--gw-teal-400`…), type scale, space, radii, motion | literals |
| 2. Semantic | `theme.css` | what a value is *for*: `--gw-surface-1`, `--gw-text-muted`, `--gw-accent`, `--gw-tone-danger-fg`…, per theme; plus the bridge onto Starlight's `--sl-*` variables | primitives |
| 3. Global | `base.css` | page, prose typography, Starlight chrome (header, sidebar, cards, pagination), utilities (`.gw-kicker`, `.gw-muted`, `.gw-tiles`, `.gw-paths`) | semantic |
| 4. Ornaments | `ornaments.css` | `.gw-frame`, `.gw-divider`, `.gw-diamond`: SVG masks from `src/assets/ornaments/` tinted with `--gw-ornament*` | semantic |

Components carry their own scoped `<style>` and read **semantic tokens only**.

**To restyle**, change `theme.css`, and `tokens.css` if you need a new raw color. Components shouldn't need edits.

## Rules (enforced by `npm run check:styles`, also in CI)

1. Color literals (`#hex`, `rgb()`, `hsl()`, `oklch()`…) only in `tokens.css`.
2. Primitive color tokens only in `tokens.css` and `theme.css`. Everywhere else, use a semantic token. If none fits, add one to `theme.css` for **both** themes.
3. Starlight color variables (`--sl-color-*`) only in `src/styles/`. Components use the `--gw-*` token they map to.
4. Every `var(--gw-…)` must exist. This catches typos, which CSS otherwise ignores silently.

Not enforced, but expected:
- No gradients. Glow only via `--gw-glow-elite`.
- Domain components (`blocks/`, `entity/`) compose `ui/` primitives rather than restyling raw HTML.
- Run through `/design-system/` in both themes after touching styles or `ui/`.

## Components

```
src/components/
  ui/        primitives, domain-agnostic — import from '../ui' (index.ts)
  blocks/    MDX blocks, auto-imported into content (SkillBar, BuildBar, GearCard, DutyBadge, BuildIndex)
  entity/    generated parts of entity pages (EntityPanel, Composition, Kit, Needs, RequirementLevel)
  gear/      Gear rendering shared by entity pages and blocks (GearChip, GearSetView, WeaponSetCard, LoadoutTable, GearNeeds)
  overrides/ Starlight component overrides (Hero, ThemeProvider, ThemeSelect, Footer, MarkdownContent)
```

| Primitive | Use for |
|---|---|
| `Panel` | any boxed section; `kicker` + `title` header, `actions` slot, `tone` neutral/accent/info; has `.gw-frame` corners |
| `PathCard` | big entry cards (home); tag, title, kicker, body slot, CTA |
| `Button` | links and buttons: `primary` (teal fill), `secondary` (outline), `ghost` |
| `Tag` | pills for labels, levels, Duties; `tone` = neutral/accent/info/success/warning/danger |
| `GameIcon` | framed game icon with placeholder fallback; `elite`, `ring`, `empty`, sizes xs–lg |
| `Tooltip` | hover/focus card (default slot = trigger, `tip` slot = content) |
| `Stat` | energy/adrenaline/activation/recharge/upkeep/sacrifice with our own glyphs |
| `List` | diamond-marked list with separators; `ordered` for run order |
| `Select` | labelled select for filters |
| `Tile` | icon card in a `.gw-tiles` grid (currently unused since the Gear/Consumable indexes went away) |
| `Divider`, `Kicker` | ornamental rule; tracked uppercase eyebrow label |

Domain meaning maps to tones **in one place each**: `entity/RequirementLevel.astro` (required → danger, recommended → warning, optional → neutral) and `blocks/SkillBar.astro` (swap → accent, filled → success).

**Adding a primitive:**
1. Create `ui/Name.astro` with a doc comment and a usage line.
2. Type its props, reusing `Tone`/`Size` from `ui/types.ts`.
3. Use semantic tokens only.
4. Export it from `ui/index.ts`.
5. Add it to `src/pages/design-system.astro`.

## Icons

Game icons are keyed by game ID and resolved by `iconFor(kind, key)` / `iconForEntity(entity)` in `src/lib/gw/icons.ts`. There are two roots; the first match wins.

| Root | Committed? | Filled by |
|---|---|---|
| `src/assets/icons/manual/<kind>/<key>.{png,jpg,webp,svg}` | yes | hand, for weapon/armour bases (no wiki icon exists) or overrides |
| `src/assets/icons/synced/<kind>/<key>.{png,jpg}` | no (gitignored) | `npm run icons:sync`, run automatically before `dev` and `build` |

Kinds: `skills/<skill id>`, `mods/<mod id>` (runes, insignias, weapon components, inscriptions), `items/<item id>` (weapon bases), `consumables/<page slug>`.

How the sync works (`scripts/sync-icons.mjs`; research in `.scratch/gw-kb/research/icon-sources.md`; decision in [ADR 0002](adr/0002-icons-from-gww-images.md)):
1. **IDs in use.** It scans the content for the IDs in use, with the same scanner as the game-data loaders (`src/lib/gw/used-ids.mjs`).
2. **File names.** It maps each ID to a Guild Wars Wiki file name (`src/lib/gw/icon-files.mjs`):
   - skill → `<English name>.jpg`
   - insignia / consumable → `<English name>.png`
   - rune → `Rune <Profession> <Minor|Major|Sup>.png`
   - weapon component and inscription → small tables
3. **Download.** It fetches `https://wiki.guildwars.com/images/<md5>/<name>`. It never calls the API, since `robots.txt` allows `/images/` and disallows `api.php`.
   - one request at a time, about 1/s
   - descriptive User-Agent
   - cached in `node_modules/.cache/gw-icons` (CI caches it)
4. **Fail soft.** A miss prints a warning and the UI draws a lettered placeholder. `GW_ICONS_OFFLINE=1` skips the network.

Only icons the pages use are fetched. Never add a bulk download: the ArenaNet Content Use Policy forbids distributing assets as standalone dumps.
