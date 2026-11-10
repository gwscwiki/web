/**
 * build-wars/gw-skilldata, pinned to a commit. The 2.1.0 tag has skills (EN/FR) but not
 * moddata/itemdata, which only exist on main, so we pin a commit instead of a tag.
 * Bump deliberately; the CI cache key includes this SHA.
 */
export const BUILD_WARS_SHA = '8495ca2c6125e1a03269c2932f099f7e7c09fb36';
export const BUILD_WARS_BASE = `https://raw.githubusercontent.com/build-wars/gw-skilldata/${BUILD_WARS_SHA}/data/json-full`;
export const CACHE_DIR = `node_modules/.cache/gw-data/${BUILD_WARS_SHA}`;
