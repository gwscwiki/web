import { SkillTemplate } from '@buildwars/gw-templates';

export interface Bar {
  code: string;
  primary: number;
  secondary: number;
  attributes: Record<number, number>;
  /** 8 game skill IDs; 0 = empty slot. */
  skills: number[];
}

export function decodeBar(code: string): Bar {
  const t = SkillTemplate.fromTemplate(code) as {
    prof_pri: number; prof_sec: number; attributes: Record<string, number>; skills: number[];
  };
  const skills = [...t.skills];
  while (skills.length < 8) skills.push(0);
  return {
    code,
    primary: t.prof_pri,
    secondary: t.prof_sec,
    attributes: Object.fromEntries(Object.entries(t.attributes).map(([k, v]) => [Number(k), v])),
    skills,
  };
}

export interface Derived {
  /** core skill → build skill, per slot */
  swaps: { slot: number; from: number; to: number }[];
  /** open core slots the Build fills */
  filled: { slot: number; skill: number }[];
  addedSecondary: number | null;
  errors: string[];
}

/** Derive swaps from a Build's pasted code against its core (Content model). */
export function deriveFromCore(core: Bar, build: Bar): Derived {
  const errors: string[] = [];
  if (core.primary !== build.primary) errors.push('primary profession differs from the core');
  if (core.secondary && core.secondary !== build.secondary) errors.push('secondary fixed by the core was changed');
  const fixed = core.skills.filter(Boolean);
  const inBuild = new Set(build.skills);
  const inCore = new Set(fixed);
  const removed = core.skills.map((s, slot) => ({ s, slot })).filter(({ s }) => s && !inBuild.has(s));
  const added = build.skills.filter((s) => s && !inCore.has(s));
  const swaps: Derived['swaps'] = [];
  const filled: Derived['filled'] = [];
  const openSlots = core.skills.map((s, i) => (s ? -1 : i)).filter((i) => i >= 0);
  added.forEach((skill, k) => {
    if (k < removed.length) swaps.push({ slot: removed[k].slot, from: removed[k].s, to: skill });
    else filled.push({ slot: openSlots[k - removed.length] ?? -1, skill });
  });
  return {
    swaps,
    filled,
    addedSecondary: !core.secondary && build.secondary ? build.secondary : null,
    errors,
  };
}
