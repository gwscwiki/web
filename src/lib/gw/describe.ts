/** Render build-wars description markup to HTML (game text is never rewritten, only cleaned). */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderDescription(raw: string): string {
  let s = raw
    // French grammar tags: masculine base form, drop the feminine alternative
    .replace(/\[f:"[^"]*"\]/g, '')
    // plural alternative: `point[pl:"points"]` → "points" (descriptions quote ranges, so plural reads right)
    .replace(/(\S+)\[pl:"([^"]*)"\]/g, '$2')
    .replace(/<sic\/>/g, '');
  const parts = s.split(/(<gray>|<\/gray>)/);
  return parts
    .map((p) => (p === '<gray>' ? '<span class="gw-gray">' : p === '</gray>' ? '</span>' : esc(p)))
    .join('');
}
