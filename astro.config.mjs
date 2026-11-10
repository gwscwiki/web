// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import AutoImport from 'astro-auto-import';
import starlightLinksValidator from 'starlight-links-validator';
import rehypeLocaleLinks from './src/plugins/rehype-locale-links.mjs';
import remarkMedia from './src/plugins/remark-media.mjs';
import { buildSidebar } from './src/lib/sidebar.mjs';

// Repo name / domain still open (map). `base` only needs to change here; prose links adapt.
const site = process.env.SITE_URL || 'https://example.github.io';
const base = process.env.SITE_BASE || '/';

export default defineConfig({
  site,
  base,
  markdown: {
    processor: unified({ remarkPlugins: [remarkMedia], rehypePlugins: [[rehypeLocaleLinks, { base }]] }),
  },
  integrations: [
    starlight({
      title: { fr: 'GW Speedclear — site non officiel', en: 'GW Speedclear — unofficial site' },
      defaultLocale: 'root',
      locales: {
        root: { label: 'Français', lang: 'fr' },
        en: { label: 'English', lang: 'en' },
      },
      sidebar: buildSidebar(),
      components: {
        MarkdownContent: './src/components/overrides/MarkdownContent.astro',
        Footer: './src/components/overrides/Footer.astro',
      },
      plugins: [starlightLinksValidator()],
    }),
    // After starlight(), which registers MDX. With the unified processor auto-import warns about order,
    // but MDX reads the shared plugin list lazily, so the imports still apply (verified by the build).
    AutoImport({
      imports: [
        './src/components/blocks/SkillBar.astro',
        './src/components/blocks/BuildBar.astro',
        './src/components/blocks/GearCard.astro',
        './src/components/blocks/DutyBadge.astro',
        './src/components/blocks/Loop.astro',
        './src/components/blocks/GearIndex.astro',
        './src/components/blocks/ConsumableIndex.astro',
        './src/components/blocks/BuildIndex.astro',
        { '@astro-community/astro-embed-youtube': ['YouTube'] },
      ],
    }),
  ],
});
