/**
 * Which game IDs the content uses — shared by the build-time loaders (src/loaders/gw-data.ts)
 * and the icon sync (scripts/sync-icons.mjs), so both fetch exactly the same set.
 * Plain JS on purpose: Node scripts import it without a TypeScript step.
 *
 * Scans every Markdown/MDX frontmatter and YAML file under src/content for: template `code`s,
 * `skill`, `modId`, `mods`, `base`, `<SkillBar code>` in prose, and Consumable `gwwTitle`s
 * (src/content/consumables/<kind>/<slug>.yaml).
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { SkillTemplate } from '@buildwars/gw-templates';

export const CONTENT_DIR = 'src/content';

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(mdx?|ya?ml)$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Skill IDs in a template code; invalid codes are ignored here (the content checks report them). */
export function skillsInCode(code) {
  if (typeof code !== 'string' || !code) return [];
  try {
    return SkillTemplate.fromTemplate(code).skills.filter((s) => s > 0);
  } catch {
    return [];
  }
}

/**
 * @returns {Promise<{ skills: Set<number>, mods: Set<number>, items: Set<number>,
 *   consumables: Map<string, string> }>} consumables: page slug → English GWW title
 */
export async function scanUsedIds() {
  const used = { skills: new Set([0]), mods: new Set(), items: new Set(), consumables: new Map() };
  const visit = (v, key) => {
    if (Array.isArray(v)) {
      if (key === 'mods') v.forEach((m) => typeof m === 'number' && used.mods.add(m));
      v.forEach((x) => visit(x));
    } else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) visit(x, k);
    } else if (key === 'code') skillsInCode(v).forEach((s) => used.skills.add(s));
    else if (key === 'skill' && typeof v === 'number') used.skills.add(v);
    else if (key === 'modId' && typeof v === 'number') used.mods.add(v);
    else if (key === 'base' && typeof v === 'number') used.items.add(v);
  };
  for (const file of await walk(CONTENT_DIR)) {
    const text = await readFile(file, 'utf8');
    if (/\.ya?ml$/.test(file)) {
      const data = parseYaml(text);
      visit(data);
      const rel = file.replace(/\\/g, '/');
      if (rel.startsWith(`${CONTENT_DIR}/consumables/`) && data?.gwwTitle)
        used.consumables.set(rel.replace(/^.*\//, '').replace(/\.ya?ml$/, ''), data.gwwTitle);
      continue;
    }
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fm) visit(parseYaml(fm[1]) ?? {});
    for (const m of text.matchAll(/<SkillBar\s+code="([^"]+)"/g)) skillsInCode(m[1]).forEach((s) => used.skills.add(s));
  }
  return used;
}
