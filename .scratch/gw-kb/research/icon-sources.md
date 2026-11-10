# Research: GW1 icon sources (skills, items, upgrades, consumables)

Date: 2026-11-10. Context: game data comes from build-wars/gw-skilldata @ `8495ca2c…`, keyed by skill ID, mod ID and item ID (`src/loaders/gw-data.ts`). Licensing is not reopened here. Icons are ArenaNet content and we use them under the ArenaNet Content Use Policy (see the prior research, §4).

**Verified** means I ran it myself on 2026-11-10 with `curl`, Python `urllib` or `gh`, sending the User-Agent `gw-kb-icon-research/0.1`. Everything else is marked *(not verified)*.

## TL;DR

- **The 403 from the earlier research no longer happens.** With a descriptive tool UA, the GWW API, the `/images/...` files and `Special:FilePath` all returned 200 (verified). The flaky part is the GWW **API**: 7 of about 30 API calls returned `503 Backend fetch failed` with `Retry-After: 5`. Varnish then caches that 503 per URL. None of the roughly 25 `/images/` requests failed.
- **GWW `robots.txt` disallows `/api.php` and `/wiki/Special:` but explicitly allows `/images/`** (verified). MediaWiki stores each file at `/images/{md5[0]}/{md5[0:2]}/{File_name}`. I checked locally computed paths against what the API returns and they match (`Healing_Signet.jpg`→`e/e6`, `Survivor_Insignia.png`→`b/b7`). So a sync script can build the image URL from the file name and **never call the API**.
- **How other GW sites do it.** They either commit an icon set keyed by skill ID that descends from the old *gwbbcode* PHP project, or they hand-collect GWW files into their own repo. Some apps fetch from GWW at runtime instead.
- **Recommendation:**
  - **Skills, runes, insignias, upgrade components, inscriptions and consumables:** a sync step that maps game IDs to GWW file names with deterministic rules plus a small committed table, then downloads only the icons our content uses from `wiki.guildwars.com/images/…`, with caching.
  - **Weapon and armour bases (`itemdata`):** GWW has no clean icons for these, so use a manual drop-in folder.
  - **Skill icons by ID:** `Wikia/pvxcode` is a fallback, or an alternative primary source if we want zero name mapping.

## 1. How the community sites get their icons

| Site / project | What they do (evidence) |
|---|---|
| **gwmarket.net** (source: [Eta92/GW-Market](https://github.com/Eta92/GW-Market), no licence) | Icons are self-hosted under `assets/items/<family>/<English_Name>.png`. The JS builds the path as `"assets/items/"+family+"/"+name.replace(/ /g,"_")+".png"`, driven by `assets/data.json` (verified: bundle `main-MIXBPL5V.js`, `data.json` 776 KB). Upgrades share one icon per component (`img: "Axe Grip"`). The repo commits about 2,900 files, all added in one "initial public commit" on 2026-01-14 (verified). Their `rune/Survivor_Insignia.png` is **byte-identical** to GWW's `File:Survivor_Insignia.png` (verified by md5), so this is a manual GWW collection keyed by English name. No skill icons. |
| **gwrevival.com** (Statamic CMS) | Shows no skill or item icons. The map links to `https://wiki.guildwars.com/wiki/<name>` and keys elite skills as `gw.skill:<id>` (verified in `WorldMap-BpjQRwT5.js`). Its [credits](https://gwrevival.com/credits/) cite GWToolbox++ data (MIT), that_shaman's map tiles, and GWW. |
| **next-guild.github.io** ([repo](https://github.com/next-guild/next-guild.github.io), no licence) | Commits `static/gwbbcode/skills/<skillId>.jpg` (1,487 files) and `thumbs/<id>.jpg`, plus 32 consumables named `Armor_of_Salvation.png` etc. (verified via the git tree). `tools/generate-gwbbcode-assets.cjs` copies them from a local unzip of **`pvxcode-master`** ([Wikia/pvxcode](https://github.com/Wikia/pvxcode)). The consumables come from a hand-made `pcons-tmp/` folder (verified: script source). |
| **Wikia/pvxcode** (the PvXwiki MediaWiki extension, GPL-2.0 code) | `images/img_skills/<id>.jpg` is 64×64 and `images/img_thumb/<id>.jpg` is 40×40, 1,487 files each (verified by downloading `1.jpg` and `2423.jpg`). The images were last changed 2020-04-24 ("Adding images for Anniversary skills"). This is the gwbbcode lineage. |
| **call-cc/gwbbcode** ("GWbbcodeJS", MIT, last push 2020) | `compiler/skills/images/<id>.jpg` (1,866 files, IDs up to 3620) plus generated sprite sheets in `public/gwbbcode/skills/skills_N.jpg` (verified: tree; `1.jpg` downloads with 200). |
| **SavvyStuffs/BOOKAH** (no licence) | `Old_App_Files_(Obsolete)/icons/skill_icons/<id>.jpg` (1,593 files), plus hand-named rune, consumable and weapon PNGs (verified: tree). Same pattern. |
| **guildwars-randomizer** (BenjaminDebotte) | Hotlinks `https://wiki.guildwars.com/wiki/Special:Filepath/${name}.jpg` (verified: `src/components/SkillIcon.tsx`). |
| **GWToolbox++** ([source](https://github.com/gwdevhub/GWToolboxpp), MIT) | Primary: reads icons out of the running client's gw.dat (`skill->icon_file_id`, `GwDatModule::LoadTextureFromFileId`). Fallback, `GetSkillImageFromGWW`: GET `https://wiki.guildwars.com/wiki/Game_link:Skill_<id>`, regex out the `class="skill-image"` `<img>`, download it, and cache it as `<id>.jpg`. Items: fetch the GWW page by name and regex the `<img alt=…>`. UA is `GWToolboxpp/<version>` (verified: `GWToolboxdll/Modules/Resources.cpp` L1123–1225, L1437–1510, L267–269). |
| **build-wars** (gw-skilldata, gw-templates, gw-template-renderer, gw-equipment, gw1-database, gw-dat) | **No images in any repo or branch**, including `gw-skilldata@gh-pages` (verified: recursive git trees). `gw-skilldata/tools/Fetchers/WikiFetcherEnglish.php` uses the GWW `api.php` for text only. `build-wars/gw-dat` is a PHP gw.dat reader, which means extracting from the client. Not recommended. `moddata.json` does carry an **`icon` field** ("icon ID", schema). It is a game file ID, not a URL, but it is very useful for grouping (§3). |

GitHub search (`gh search repos`) turned up no other repo that commits a GW1 skill or item icon set beyond the ones above.

## 2. Access tests (all verified 2026-11-10, UA `gw-kb-icon-research/0.1`)

| Endpoint | Result |
|---|---|
| GWW `api.php?action=query&meta=siteinfo` | 200 JSON (MediaWiki 1.44.6). The same with curl's default UA: 200. |
| GWW `api.php?…&prop=imageinfo&iiprop=url\|size` for `File:Healing_Signet.jpg` | 200 → `https://wiki.guildwars.com/images/e/e6/Healing_Signet.jpg`, 64×64 |
| GWW `/images/e/e6/Healing_Signet.jpg` | 200 `image/jpeg` 5,965 B (64×64). Every computed-hash `/images/` URL I tried returned 200. |
| GWW `/wiki/Special:FilePath/Healing_Signet.jpg` and `Special:Redirect/file/…` | 200 after redirect (but `/wiki/Special:` is disallowed in `robots.txt`) |
| GWW `api.php?action=query&titles=Game_link:Skill_1\|…&redirects` | 200. Resolves the ID to the skill name (namespace 102; e.g. 3446 → "Soul Ignition") |
| GWW `list=allimages` / `list=allpages` | **Intermittent `503 Backend fetch failed`, `Retry-After: 5`, `x-cache: miss cached`.** Some URLs kept failing after 3 paced retries. |
| GWW `robots.txt` | `Disallow: /api.php`, `/index.php`, `/wiki/Special:`, `/*?action=`; **`Allow: /images/`** |
| gwiki.fr `w/api.php` (siteinfo, imageinfo) | 200. `Fichier:Sceau de guérison.png` → `https://www.no-cookie.com/w/images/e/e1/Sceau_de_gu%C3%A9rison.png` (64 px). Download: 200 `image/png`. Its `robots.txt` doesn't block `/w/api.php` for `*`. Files are named after the **French** name and are PNG. |
| Fandom `guildwars.fandom.com/api.php` imageinfo | 200 → `static.wikia.nocookie.net/gwwikia/images/e/e6/Healing_Signet.jpg/revision/latest?cb=…` |
| Fandom `static.wikia.nocookie.net` image | **403, Cloudflare "Just a moment…" challenge** with both the tool UA and curl's default UA. Not pursued. |
| `raw.githubusercontent.com/Wikia/pvxcode/<sha>/images/img_skills/<id>.jpg` | 200 |
| gwmarket.net `/assets/items/...png`, `/assets/data.json` | 200 (`robots.txt` allows everything). A few requests only. No licence, so these files can't be reused. |

## 3. What icon each category uses, and how to map build-wars IDs

GWW conventions (verified from templates): `Template:Skill infobox` renders `{{{image|[[File:{{{name}}}.jpg]]}}}`, so a skill icon is **`File:<English skill name>.jpg`**. `Template:Item infobox` renders `{{{image|[[Image:{{PAGENAME}}.png]]}}}`, so an item icon is **`File:<page name>.png`**. Skill pages also carry `| id = <skillId>` (e.g. Healing Signet `id = 1`).

**Skills (skilldata, 1,517 IDs)**
- Rule: `file = en_name(id) + ".jpg"`. For PvP splits (`is_pvp && split_id`), use the base skill's name. GWW has no `Healing Signet (PvP).jpg`, while `Crippling Shot.jpg` exists.
- Verified with HEAD requests to hashed `/images/` URLs: 11 of 11 returned 200. The sample covered quotes and `!` (`"To the Limit!"`, `"Coward!"`), apostrophes (`Wastrel's Worry`), PvP splits (3450 → Crippling Shot, 3437 → Farmer's Scythe), Soul Ignition 3446 (uploaded 2026-08-26), and 2070, 2423 and 3431.
- Size and format: 64×64 JPEG. Some skills also have a newer 64×64 PNG (e.g. `Healing_Signet.png`, 2026), but the infobox still uses `.jpg`.
- **Alternative keyed by ID:** pvxcode `img_skills/<id>.jpg`, pinned at `3ac836f3d9ae50986f2a106d4459ccb929a0aead`. It covers **1,484 of the 1,517** build-wars IDs (verified by comparing ID sets). The 33 missing are 32 PvP splits, all of whose `split_id` is covered, plus **3446 Soul Ignition**. The files date from 2020 or earlier, so they're older encodes (not byte-identical to GWW).

**Runes (moddata type 2, `for: 1`)**: one icon per profession × tier, **not** per attribute. moddata already groups them by `icon` (e.g. 23671 is every Mesmer Minor rune). GWW files (verified via `allimages`): `Rune_<Profession>_<Minor|Major|Sup>.png` (51×62; Dervish and Paragon are 38–52 px wide). The non-profession runes use `Rune_All_Minor.png` (icon 151852: Minor Vigor, Attunement, Vitae), `Rune_All_Major.png` (151853) and `Rune_Vigor_Sup.png` (151854). The GWW "Rune of Vigor" page shows `Rune All Sup.png` instead.

**Insignias (type 1, `for: 1`, 45 mods)**: each insignia has its own icon ID and its own GWW file `<Name>.png`, 64×64. Verified: `Survivor_Insignia.png`, `Vanguard's_Insignia.png`, `Windwalker_Insignia.png`.

**Weapon prefixes/suffixes (types 1 and 2, `for` = weapon type)**: one icon per component, whatever the element or bonus. moddata `icon` → GWW file. Verified 64×64 unless noted:
- 19872 `Axe_Haft`
- 91655 `Bow_String`. The page image is listed on the `Bowstring` page; imageinfo not checked.
- 19873 `Hammer_Haft`
- 20015 `Sword_Hilt`
- 164795 `Staff_Head`
- 164837 `Dagger_Tang`
- 205895 `Scythe_Snathe`
- 205896 `Spearhead`
- 91650 `Axe_Grip`
- 91653 `Bow_Grip`
- 91654 `Hammer_Grip`
- 164796 `Staff_Wrapping`
- 91656 `Sword_Pommel`
- 164856 `Dagger_Handle`
- 205917 `Scythe_Grip`
- 205921 `Spear_Grip`
- 205913 `Focus_Core`
- 205916 `Wand_Wrapping`
- 205920 `Shield_Handle`

Every file is `.png`.

**Inscriptions (type 3, 50 mods)**: individual inscription pages redirect to `Inscription`. The GWW page uses one icon per item class, 54×54 PNG, all six verified: `Inscription_weapons`, `_martial_weapons`, `_spellcasting_weapons`, `_focus_items`, `_focus_items_or_shields`, `_equippable_items`. moddata gives 4 icon IDs, and the `for` values point to these classes:

| moddata icon / `for` | Class | Example | GWW file |
|---|---|---|---|
| 205892 / 37 | all weapons | "Don't Think Twice" | `Inscription_weapons.png` |
| 205890 / 38 | martial weapons | "I have the power!" | `Inscription_martial_weapons.png` |
| 205891 / 39 | equippable items | "Soundness of Mind" | `Inscription_equippable_items.png` |
| 205889 / 12 and 41 | focus items, and focus or shields | "Serenity Now", "Have Faith" | `Inscription_focus_items.png` / `…_or_shields.png` |

This mapping is my inference: check it by eye once.

**Weapon and armour bases (itemdata, 336 IDs)**: **no clean source.** GWW has a 64×64 icon for some bases (`Flatbow.png`, `Inscribed_Staff.png`, verified). Others have none (`Scythe`, `Cane`, `Daggers`, `Spear`, `Axe`, `Strength_Shield`, `Inscribed_Chakram`, `Imposing_Mask`, `Enchanter_Footwear`). Their pages show weapon-skin screenshots (`Cane (Domination).jpg`) or armour galleries instead, and `Sword.png` is a 499×439 render. Use a manual drop-in, or a per-slot or per-weapon-type generic icon.

**Consumables (not in build-wars)**: `File:<Name>.png`, 64×64. Verified: `Armor_of_Salvation`, `Grail_of_Might`, `Essence_of_Celerity`, `Birthday_Cupcake`. Watch the name collision: `Armor_of_Salvation_(skill).jpg` also exists. They need a small hand-kept list (slug → English GWW name). next-guild's 32-item list is a good checklist.

## 4. Candidate sources compared

| Source | Skills | Runes / insignias / mods / inscriptions | Weapons, armour | Consumables | ID mapping | Scripted access | Terms |
|---|---|---|---|---|---|---|---|
| **GWW `/images/` (hash path)** | all (incl. 2026 skills) | all (rules above) | partial / none | yes | build-wars EN name + rules + small table | 200; `/images/` allowed by robots | icons tagged "ArenaNet image … not third-party"; we rely on the ArenaNet policy |
| GWW API (`imageinfo`, `Game_link:`) | to resolve names | to resolve names | — | — | direct ID via `Game link:Skill_<id>` | works but 503-prone; **robots disallows `/api.php`** | same |
| Wikia/pvxcode (GitHub) | 1,484/1,517 by ID | none | none | none | **direct skill ID** | 200, stable (pinned SHA) | GPL-2.0 code; images are ArenaNet's |
| call-cc/gwbbcode | by ID (1,866 files) | none | none | none | direct ID | 200 | MIT code; ArenaNet images; stale since 2020 |
| gwiki.fr | yes (FR names, PNG) | yes (FR names) | ? | ? | FR name | 200 (API + `no-cookie.com` CDN) | CC/GFDL text; ArenaNet images |
| Fandom GuildWiki | yes | yes | ? | ? | EN name | API 200, **images 403 (Cloudflare)** | CC-BY-SA text |
| gwmarket / GW-Market repo | none | yes, by EN name | named rares only | yes | EN name | 200 | **no licence; don't copy** |

## 5. Recommended pipeline

This fits the existing `gw-data` model: pinned inputs, only the IDs that content uses, and a cache in `node_modules/.cache`.

1. **`src/lib/gw/icons.ts`, mapping (pure, unit-testable):** `iconFile(kind, id)` returns a GWW file name.
   - skill → `en_name(split_id if is_pvp && split_id else id) + ".jpg"`
   - rune, upgrade or inscription mod → table keyed by **moddata `icon`** (about 45 entries, committed as `src/lib/gw/icon-map.json`; values from §3)
   - insignia → `en_name + ".png"`
   - consumable → `en_name + ".png"` from a hand-kept list
   - item base → table or `null`
2. **URL:** `f = file.replace(/ /g, '_')`, `h = md5(utf8(f))`, then `https://wiki.guildwars.com/images/${h[0]}/${h.slice(0,2)}/${encodeURIComponent(f)}`. There's no API call, and `/images/` is robots-allowed.
3. **Sync step:** reuse `scanUsedIds()` to collect skill, mod and item IDs plus consumable slugs. Then:
   - For each icon not already in `node_modules/.cache/gw-icons/<BUILD_WARS_SHA>/`, GET it sequentially at about 1 req/s.
   - UA: `gw-kb/<version> (+https://github.com/<repo>)`.
   - On 5xx, retry once after `Retry-After`.
   - Copy the result into a gitignored output folder, e.g. `public/gw-icons/<kind>/<id>.<ext>`, or `src/assets/` if you want the Astro image pipeline.
   - Run it from `prebuild`/`predev` next to `copy-sveltia.mjs`, or inside the loaders so the collections expose `icon` paths.
4. **Fail soft:** if a download fails or returns 404, use a placeholder and print a warning listing the missing names. A GWW outage should never break the build. CI already caches `node_modules/.cache`.
5. **Manual drop-in (always wins):** a committed `src/assets/gw-icons-manual/<kind>/<id>.png`. The sync checks it first. It covers weapon and armour bases, mapping misses, and any source that later blocks scripts. As a skill fallback, pvxcode's `img_skills/<id>.jpg` at the pinned SHA can fill gaps automatically.
6. **Don't** hotlink GWW at runtime, crawl the API, or ship a full icon dump. Fetch only what the content uses: that keeps us inside the "no standalone asset dumps" constraint.

If you prefer zero name logic for skills, use pvxcode by ID as the primary source and GWW only for 3446 Soul Ignition and future skills. The trade-off is older encodes (2020 or earlier) and a frozen repo.

## Sources

- GWW templates, read via the API: `Template:Skill_infobox`, `Template:Item_infobox`; pages `Inscription`, `Rune of Fast Casting`, `Rune of Vigor`, `Bowstring`; https://wiki.guildwars.com/robots.txt
- GWToolbox++ `GWToolboxdll/Modules/Resources.cpp` (master, 2026-11-10): https://github.com/gwdevhub/GWToolboxpp/blob/master/GWToolboxdll/Modules/Resources.cpp
- next-guild generator: https://github.com/next-guild/next-guild.github.io/blob/main/tools/generate-gwbbcode-assets.cjs
- pvxcode: https://github.com/Wikia/pvxcode/tree/3ac836f3d9ae50986f2a106d4459ccb929a0aead/images
- gwbbcode JS: https://github.com/call-cc/gwbbcode ; BOOKAH: https://github.com/SavvyStuffs/BOOKAH
- GW-Market: https://github.com/Eta92/GW-Market ; randomizer: https://github.com/BenjaminDebotte/guildwars-randomizer/blob/main/src/components/SkillIcon.tsx
- build-wars moddata schema: https://build-wars.github.io/gw-skilldata/schemas/moddata.schema.json ; fetcher: https://github.com/build-wars/gw-skilldata/blob/main/tools/Fetchers/WikiFetcherEnglish.php
- gwrevival credits: https://gwrevival.com/credits/ ; gwiki.fr API: https://www.gwiki.fr/w/api.php
- Coverage numbers: computed locally against the cached `skilldata.json` and `moddata.json` at `8495ca2c`.
