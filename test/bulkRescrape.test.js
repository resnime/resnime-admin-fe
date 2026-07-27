import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Bulk review re-scrape reuses manual scraper and only applies to active form", async () => {
  const bulkImport = await readFile(
    new URL("../src/components/BulkImport.jsx", import.meta.url),
    "utf8",
  );

  assert.match(bulkImport, /import \{ bulkUpsertAnime, scrapeAnime, submitAnimeToTurso \}/);
  assert.match(bulkImport, /Scrape Again/);
  assert.match(bulkImport, /Scrape Anime Again/);
  assert.match(bulkImport, /Fill Missing Fields/);
  assert.match(bulkImport, /Replace with Scraped Data/);
  assert.match(bulkImport, /scrapeAnime\(activeItem\.id\)/);
  assert.match(bulkImport, /mergeScrapedAnimeData/);
  assert.match(bulkImport, /bulkForm\.setFieldsValue\(mergedAnime\)/);
  assert.doesNotMatch(bulkImport, /saveItems\(mergedAnime\)/);
});
