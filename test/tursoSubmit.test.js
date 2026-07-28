import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("frontend submits anime through backend API without Turso credentials", async () => {
  const [app, api, packageJson] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/services/animeApi.js", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(api, /\/api\/anime\/upsert/);
  assert.match(app, /Submit to Turso/);
  assert.match(app, /validateFields\(\)/);
  assert.match(app, /const values = normalizeAnimeEpisodeDates\(animeForm\.getFieldsValue\(true\)\)/);
  assert.match(app, /submitAnimeToTurso\(values\)/);
  assert.match(app, /title_en: ""[\s\S]*title_native: ""[\s\S]*title_romaji: ""/);
  assert.match(app, /Modal\.confirm/);
  assert.doesNotMatch(api, /TURSO_/);
  assert.doesNotMatch(packageJson, /@libsql\/client/);
});
