import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Bulk review can fetch stored Turso data into form and preview by active MAL ID", async () => {
  const [bulkImport, api] = await Promise.all([
    readFile(new URL("../src/components/BulkImport.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/services/animeApi.js", import.meta.url), "utf8"),
  ]);

  assert.match(api, /fetchAnimeFromTurso/);
  assert.match(api, /\/api\/anime\/\$\{encodeURIComponent\(String\(malId\)\)\}/);
  assert.match(bulkImport, /fetchAnimeFromTurso\(activeItem\.id\)/);
  assert.match(bulkImport, /bulkForm\.setFieldsValue\(fetchedAnime\)/);
  assert.match(bulkImport, /setPreviewAnime\(fetchedAnime\)/);
  assert.match(bulkImport, /setReviewDirty\(true\)/);
  assert.match(bulkImport, /Fetch from Turso/);
  assert.doesNotMatch(bulkImport, /saveItems\(fetchedAnime\)/);
});
