// Prose blocks for Sveltia's rich-text editor (Storage mapping: self-closing, one per line, string attributes).
// Each pattern matches exactly what toBlock writes, so blocks round-trip without edits.
const attr = (name) => `${name}="([^"]*)"`;
const block = (tag, names) => new RegExp(`^<${tag} ${names.map(attr).join(' ')} />$`, 'm');

const components = [
  {
    id: 'skill-bar',
    label: 'Barre (code brut)',
    fields: [{ name: 'code', label: 'Code du template', widget: 'string' }],
    pattern: block('SkillBar', ['code']),
    fromBlock: (m) => ({ code: m[1] }),
    toBlock: ({ code }) => `<SkillBar code="${code ?? ''}" />`,
    toPreview: ({ code }) => `[SkillBar ${code ?? ''}]`,
  },
  {
    id: 'build-bar',
    label: 'Barre (Build)',
    fields: [{ name: 'build', label: 'Build', widget: 'relation', collection: 'vos-builds', value_field: 'builds/vos/{{slug}}' }],
    pattern: block('BuildBar', ['build']),
    fromBlock: (m) => ({ build: m[1] }),
    toBlock: ({ build }) => `<BuildBar build="${build ?? ''}" />`,
    toPreview: ({ build }) => `[BuildBar ${build ?? ''}]`,
  },
  {
    // A relation targets one collection, so this block only offers runes (any gear id works in the text).
    id: 'gear-card',
    label: 'Équipement',
    fields: [{ name: 'gear', label: 'Équipement', widget: 'relation', collection: 'gear-runes', value_field: 'runes/{{slug}}' }],
    pattern: block('GearCard', ['gear']),
    fromBlock: (m) => ({ gear: m[1] }),
    toBlock: ({ gear }) => `<GearCard gear="${gear ?? ''}" />`,
    toPreview: ({ gear }) => `[GearCard ${gear ?? ''}]`,
  },
  {
    id: 'duty-badge',
    label: 'Duty',
    fields: [{ name: 'duty', label: 'Duty', widget: 'relation', collection: 'fow-duties', value_field: 'fow/duties/{{slug}}', display_fields: ['label'] }],
    pattern: block('DutyBadge', ['duty']),
    fromBlock: (m) => ({ duty: m[1] }),
    toBlock: ({ duty }) => `<DutyBadge duty="${duty ?? ''}" />`,
    toPreview: ({ duty }) => `[DutyBadge ${duty ?? ''}]`,
  },
  {
    id: 'loop',
    label: 'Boucle vidéo',
    fields: [{ name: 'src', label: 'Nom du fichier (sans extension)', widget: 'string' }],
    pattern: block('Loop', ['src']),
    fromBlock: (m) => ({ src: m[1] }),
    toBlock: ({ src }) => `<Loop src="${src ?? ''}" />`,
    toPreview: ({ src }) => `[Loop ${src ?? ''}]`,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    fields: [
      { name: 'id', label: 'ID de la vidéo', widget: 'string' },
      { name: 'params', label: 'Paramètres (ex. start=45)', widget: 'string', required: false },
    ],
    pattern: /^<YouTube id="([^"]*)"(?: params="([^"]*)")? \/>$/m,
    fromBlock: (m) => ({ id: m[1], params: m[2] ?? '' }),
    toBlock: ({ id, params }) => `<YouTube id="${id ?? ''}"${params ? ` params="${params}"` : ''} />`,
    toPreview: ({ id }) => `[YouTube ${id ?? ''}]`,
  },
];

for (const c of components) CMS.registerEditorComponent(c);
CMS.init();
