# Skeleton prototype

Type: prototype
Status: open
Blocked by: 01, 04, 05, 06

## Question

Does the architecture hold up when built? Scaffold the Starlight site with the decided collections and schemas, plus one sample page per content type (Build core, Build, Zone/Role, Duty, Gear, Consumable) in French with an English fallback, for the user to react to. This is executed work (see map Notes override). Verify the items [Starlight capabilities](02-starlight-capabilities.md) left open: `reference()` inside `docsSchema({ extend })`, priority of generated routes next to Starlight's `[...slug]`, and the fallback-search middleware. From [Skill & item data sources](01-skill-and-item-data-sources.md): run `@buildwars/gw-templates` at build time on Node 24 against a sample Build; render a French skill description with its grammar tags; include the unofficial-site title and the ArenaNet footer notice.

From [Content model](03-content-model.md):
- Use the real VoS core code `OgCjkirMrSmXfbaXNX3lcXsX5iA`, a v3 Build (stab → IAU) and a slot alternative (battle stand → Ebon Escape / Death's Charge, D/A), with placeholder Duties.
- Show swaps derived from the pasted code.
- Include a bar block from a raw code and a gear block in prose.
- Edit at least one page through the editor chosen in [Visual editor](08-visual-editor.md).

From [Visual editor](08-visual-editor.md), if Sveltia is chosen, prototype with its local-folder workflow:
- check the paths it actually writes for `{{locale}}` folders and `omit_default_locale_from_file_path`
- check that a `relation` inside an editor component writes the slug
- check `initial_locales` behaviour for FR-only entries
- check the OAuth Worker under the GitHub Pages `base` path
