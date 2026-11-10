#!/usr/bin/env node
/**
 * Icon sync (docs/design-system.md § Icons). Runs before dev and build.
 *
 * For every skill, rune/insignia/weapon mod and consumable the content uses (same scan as the
 * game-data loaders), download its Guild Wars Wiki icon into src/assets/icons/synced/ (gitignored).
 * Only icons in use are fetched — never a full set (ArenaNet Content Use Policy: no asset dumps).
 *
 *  - Downloads are cached in node_modules/.cache/gw-icons (CI caches it), so a warm run is offline.
 *  - src/assets/icons/manual/<kind>/<key>.* always wins and is never fetched (weapon/armour bases,
 *    mapping misses, or any icon we'd rather pick by hand).
 *  - Polite: one request at a time, ~1/s, descriptive User-Agent, one retry on 5xx.
 *  - Fail soft: a missing icon prints a warning and the UI shows a placeholder. Never fails the build.
 *  - GW_ICONS_OFFLINE=1 skips the network entirely.
 */
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { BUILD_WARS_BASE, CACHE_DIR as DATA_CACHE } from '../src/lib/gw/source.mjs';
import { scanUsedIds } from '../src/lib/gw/used-ids.mjs';
import { consumableIconFile, gwwImageUrl, modIconFile, skillIconFile } from '../src/lib/gw/icon-files.mjs';

const ICON_CACHE = 'node_modules/.cache/gw-icons';
const OUT = 'src/assets/icons/synced';
const MANUAL = 'src/assets/icons/manual';
const UA = 'gw-kb-icon-sync/0.1 (static Guild Wars 1 fansite build; fetches only icons its pages use)';
const OFFLINE = process.env.GW_ICONS_OFFLINE === '1';
const MAX_BYTES = 256 * 1024;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastRequest = 0;

async function politeFetch(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const wait = 1000 - (Date.now() - lastRequest);
    if (wait > 0) await sleep(wait);
    lastRequest = Date.now();
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status < 500 || attempt === 1) return res;
    await sleep(Math.min(10, Number(res.headers.get('retry-after')) || 5) * 1000);
  }
}

async function json(file) {
  const cached = join(DATA_CACHE, file);
  if (existsSync(cached)) return JSON.parse(await readFile(cached, 'utf8'));
  if (OFFLINE) throw new Error(`${file} not cached and GW_ICONS_OFFLINE=1`);
  const res = await fetch(`${BUILD_WARS_BASE}/${file}`);
  if (!res.ok) throw new Error(`${file} → HTTP ${res.status}`);
  const text = await res.text();
  await mkdir(DATA_CACHE, { recursive: true });
  await writeFile(cached, text);
  return JSON.parse(text);
}

const hasManual = async (kind, key) =>
  existsSync(join(MANUAL, kind)) && (await readdir(join(MANUAL, kind))).some((f) => f.replace(/\.\w+$/, '') === String(key));

/** Cache path for a GWW file: hashed, since wiki names can hold characters Windows forbids (`"`). */
const cachePath = (file) => join(ICON_CACHE, createHash('sha1').update(file).digest('hex').slice(0, 16) + file.match(/\.\w+$/)[0].toLowerCase());

/** Get one GWW file into the cache. Returns { path } or { error }. */
async function cacheFile(file) {
  const cached = cachePath(file);
  if (existsSync(cached)) return { path: cached };
  if (OFFLINE) return { error: 'offline, not cached' };
  try {
    const res = await politeFetch(gwwImageUrl(file));
    if (!res.ok) return { error: `HTTP ${res.status}` };
    if (!/^image\//.test(res.headers.get('content-type') ?? '')) return { error: `not an image (${res.headers.get('content-type')})` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_BYTES) return { error: `too large (${buf.length} B)` };
    await mkdir(ICON_CACHE, { recursive: true });
    await writeFile(cached, buf);
    return { path: cached };
  } catch (e) {
    return { error: String(e.message ?? e) };
  }
}

async function main() {
  const used = await scanUsedIds();
  const [skilldata, descEn, moddata] = await Promise.all([json('skilldata.json'), json('skilldesc-en.json'), json('moddata.json')]);

  /** @type {{ kind: string, key: string|number, file?: string }[]} */
  const wanted = [
    ...[...used.skills].filter((id) => id > 0).map((id) => ({ kind: 'skills', key: id, file: skillIconFile(id, skilldata.skilldata, descEn.skilldesc) })),
    ...[...used.mods].map((id) => ({ kind: 'mods', key: id, file: modIconFile(moddata.moddata[id]) })),
    ...[...used.consumables].map(([slug, title]) => ({ kind: 'consumables', key: slug, file: consumableIconFile(title) })),
  ];

  await rm(OUT, { recursive: true, force: true });
  const missing = [];
  let fetched = 0;
  let copied = 0;
  for (const w of wanted) {
    if (await hasManual(w.kind, w.key)) continue;
    if (!w.file) {
      missing.push(`${w.kind}/${w.key}: no icon mapping`);
      continue;
    }
    const before = existsSync(cachePath(w.file));
    const r = await cacheFile(w.file);
    if (r.error) {
      missing.push(`${w.kind}/${w.key} (${w.file}): ${r.error}`);
      continue;
    }
    if (!before) fetched++;
    const ext = w.file.match(/\.\w+$/)[0].toLowerCase();
    await mkdir(join(OUT, w.kind), { recursive: true });
    await copyFile(r.path, join(OUT, w.kind, `${w.key}${ext}`));
    copied++;
  }

  // Item bases have no GWW icon convention: report the ones without a manual file.
  for (const id of used.items) if (!(await hasManual('items', id))) missing.push(`items/${id}: add src/assets/icons/manual/items/${id}.png by hand`);

  console.log(`icons: ${copied} ready (${fetched} downloaded${OFFLINE ? ', offline' : ''}) → ${OUT}`);
  if (missing.length) console.warn(`icons: ${missing.length} missing, placeholders will show:\n  ${missing.join('\n  ')}`);
}

main().catch((e) => {
  // Never block dev/build on icons.
  console.warn(`icons: sync skipped — ${e.message ?? e}`);
});
