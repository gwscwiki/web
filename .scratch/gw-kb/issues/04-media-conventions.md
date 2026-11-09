# Media conventions

Type: grilling
Status: open
Blocked by:

## Question

Where do videos, short loops and screenshots live in the repo, how are they named, and how does a Duty (or Build/Gear) page reference them? What formats and size limits apply to self-hosted loops? Are media shared between locales or per-locale (e.g. screenshots with French UI)?

From [Visual editor](08-visual-editor.md): with Sveltia (recommended), screenshots are only optimised by Astro if they sit in a page bundle next to the page (`<slug>/index.mdx` with the image beside it). An image uploaded in one locale is saved in that locale's bundle, and a shared image stored once in the FR bundle won't resolve from the EN page. Decide how this fits the per-locale vs shared screenshot question.
