// Copy the exact-pinned @sveltia/cms bundle into public/admin/ (gitignored). Runs before dev and build.
import { copyFileSync, readFileSync } from 'node:fs';

copyFileSync('node_modules/@sveltia/cms/dist/sveltia-cms.js', 'public/admin/sveltia-cms.js');
const { version } = JSON.parse(readFileSync('node_modules/@sveltia/cms/package.json', 'utf8'));
console.log(`sveltia-cms ${version} → public/admin/sveltia-cms.js`);
