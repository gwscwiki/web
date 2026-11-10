/** Shapes Strategy rows for <Composition>: links and labels in the reader's language. */
import { entity, titleOf, urlOf, type Entity, type StrategyRole } from './kb';
import { decodeBar } from './gw/templates';
import { PROFESSIONS, type Lang } from './gw/names';

export const link = async (id: string | { id: string }, lang: Lang) => ({ href: urlOf(id, lang), text: await titleOf(id, lang) });

/** "D/A" for a template code. */
export const profsOf = (code: string) => {
  const b = decodeBar(code);
  return `${PROFESSIONS[b.primary].abbr}/${b.secondary ? PROFESSIONS[b.secondary].abbr : '–'}`;
};

/** One composition row; with `strategy`, the row names it (for lists across Strategies). */
export async function compRow(row: StrategyRole, lang: Lang, strategy?: Entity<'strategy'>) {
  const build = row.build ? await entity(row.build, 'build') : undefined;
  return {
    role: row.role,
    build: build ? { ...(await link(build.id, lang)), profs: profsOf(build.data.code) } : undefined,
    duties: await Promise.all(row.duties.map((d) => link(d, lang))),
    route: row.route,
    strategy: strategy && { ...(await link(strategy.id, lang)), id: strategy.id, isDefault: strategy.data.default },
  };
}
