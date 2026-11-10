/**
 * Design-system primitives (docs/design-system.md). Domain-agnostic: nothing here knows about
 * Builds, Gear or Requirements — domain components in blocks/ and entity/ compose these.
 */
export { default as Button } from './Button.astro';
export { default as Divider } from './Divider.astro';
export { default as GameIcon } from './GameIcon.astro';
export { default as Kicker } from './Kicker.astro';
export { default as List } from './List.astro';
export { default as Panel } from './Panel.astro';
export { default as PathCard } from './PathCard.astro';
export { default as Select } from './Select.astro';
export { default as Stat } from './Stat.astro';
export { default as Tag } from './Tag.astro';
export { default as Tile } from './Tile.astro';
export { default as Tooltip } from './Tooltip.astro';
export type { Size, Tone } from './types';
