#!/usr/bin/env node
/**
 * Design-system guardrails (docs/design-system.md § Rules). Run in CI: `npm run check:styles`.
 *
 *  1. Color literals (#hex, rgb(), hsl(), oklch()…) only in src/styles/tokens.css.
 *  2. Primitive color tokens (--gw-violet-400 …) only in tokens.css and theme.css;
 *     everything else reads semantic tokens (--gw-accent, --gw-surface-1 …).
 *  3. Starlight color variables (--sl-color-*) only in src/styles/ (the bridge and chrome overrides).
 *  4. Every var(--gw-*) used must be defined (catches typos, which CSS silently ignores).
 *
 * Checked: .css files, and <style> blocks plus style="…" attributes in .astro files.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src';
const TOKENS = 'src/styles/tokens.css';
const THEME = 'src/styles/theme.css';
const errors = [];

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name).replace(/\\/g, '/')],
  );

/** Style text of a file with line numbers kept (non-style parts blanked). */
function styleText(file, text) {
  if (file.endsWith('.css')) return text;
  const keep = new Array(text.length).fill(' ');
  const mark = (start, end) => { for (let i = start; i < end; i++) keep[i] = text[i]; };
  for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) mark(m.index, m.index + m[0].length);
  for (const m of text.matchAll(/\bstyle=(["'`{])([\s\S]*?)\1/g)) mark(m.index, m.index + m[0].length);
  return keep.map((c, i) => (text[i] === '\n' ? '\n' : c)).join('');
}
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
const lineOf = (s, idx) => s.slice(0, idx).split('\n').length;

// Token definitions
const defs = (file) => new Set([...readFileSync(file, 'utf8').matchAll(/(--gw-[\w-]+)\s*:/g)].map((m) => m[1]));
const tokenText = readFileSync(TOKENS, 'utf8');
const defined = new Set([...defs(TOKENS), ...defs(THEME)]);
const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(|\btransparent\b/;
const primitives = new Set(
  [...tokenText.matchAll(/(--gw-[\w-]+)\s*:\s*([^;]+);/g)].filter((m) => COLOR.test(m[2])).map((m) => m[1]),
);

const files = walk(SRC).filter((f) => /\.(css|astro)$/.test(f));
for (const file of files) {
  const css = stripComments(styleText(file, readFileSync(file, 'utf8')));
  const isTokens = file === TOKENS;
  const isStyles = file.startsWith('src/styles/');

  if (!isTokens) {
    for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/g)) {
      // `#id { … }` is a selector, not a color: the next delimiter after it is `{`.
      if (m[0].startsWith('#') && css.slice(m.index).match(/[;{}\n"'`]/)?.[0] === '{') continue;
      errors.push(`${file}:${lineOf(css, m.index)}: color literal "${m[0]}" — add a token to tokens.css and use a semantic token`);
    }
  }
  if (file !== TOKENS && file !== THEME) {
    for (const m of css.matchAll(/var\((--gw-[\w-]+)/g)) {
      if (primitives.has(m[1])) errors.push(`${file}:${lineOf(css, m.index)}: primitive token ${m[1]} — use a semantic token from theme.css`);
    }
  }
  if (!isStyles) {
    for (const m of css.matchAll(/var\((--sl-color-[\w-]+)/g)) {
      errors.push(`${file}:${lineOf(css, m.index)}: Starlight variable ${m[1]} — use the --gw-* semantic token it maps to`);
    }
  }
  for (const m of css.matchAll(/var\((--gw-[\w-]+)(\$\{)?/g)) {
    if (m[2]) continue; // built in a template literal, e.g. var(--gw-text-${size})
    if (!defined.has(m[1])) errors.push(`${file}:${lineOf(css, m.index)}: undefined token ${m[1]}`);
  }
}

if (errors.length) {
  console.error(`check:styles — ${errors.length} problem(s):\n` + errors.map((e) => `  ${e}`).join('\n'));
  process.exit(1);
}
console.log(`check:styles — ${files.length} files OK (${defined.size} tokens, ${primitives.size} primitive colors)`);
