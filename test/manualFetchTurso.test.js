import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Manual input can fetch stored Turso data into form and preview by current MAL ID", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(app, /fetchAnimeFromTurso/);
  assert.match(app, /const \[fetchingTursoAnime, setFetchingTursoAnime\] = useState\(false\)/);
  assert.match(app, /fetchAnimeFromTurso\(malId\)/);
  assert.match(app, /animeForm\.setFieldsValue\(fetchedAnime\)/);
  assert.match(app, /setPreviewAnime\(fetchedAnime\)/);
  assert.match(app, /setHasData\(true\)/);
  assert.match(app, /Fetch from Turso/);
});
