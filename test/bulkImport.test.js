import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeBulkUploadItems,
  stripBulkMetadata,
} from "../src/utils/bulkImport.js";

test("normalizeBulkUploadItems skips invalid and duplicate MAL IDs without overwriting reviewed existing items", () => {
  const existingItems = [
    {
      id: "52991",
      title_native: "Reviewed native",
      title_romaji: "Reviewed title",
      is_reviewed: true,
      import_status: "imported",
      genres: [],
      episodes: [],
      characters: [],
    },
    {
      id: "21",
      title_romaji: "Old title",
      is_reviewed: false,
      import_status: "failed",
      genres: [],
      episodes: [],
      characters: [],
    },
  ];

  const result = normalizeBulkUploadItems(
    [
      { id: "52991", title_romaji: "Should not overwrite" },
      { id: "21", title_native: "更新", title_romaji: "Updated title", is_reviewed: true },
      { id: "11061", title_en: "Hunter x Hunter", title_native: " ハンター×ハンター ", genres: "bad" },
      { id: "11061", title_en: "Duplicate" },
      { id: "abc", title_en: "Invalid" },
    ],
    existingItems,
  );

  assert.equal(result.items.length, 3);
  assert.equal(result.items.find((item) => item.id === "52991").title_native, "Reviewed native");
  assert.equal(result.items.find((item) => item.id === "21").title_native, "更新");
  assert.equal(result.items.find((item) => item.id === "11061").title_native, "ハンター×ハンター");
  assert.equal(result.items.find((item) => item.id === "52991").title_romaji, "Reviewed title");
  assert.equal(result.items.find((item) => item.id === "21").title_romaji, "Updated title");
  assert.equal(result.items.find((item) => item.id === "21").import_status, "failed");
  assert.deepEqual(result.items.find((item) => item.id === "11061").genres, []);
  assert.deepEqual(result.summary, {
    added: 1,
    updated: 1,
    reviewedSkipped: 1,
    invalidSkipped: 1,
    duplicateSkipped: 1,
  });
  assert.equal(result.skipped.length, 3);
});

test("bulk normalizers keep older JSON and localStorage compatible with title_native", async () => {
  const { parseStoredBulkItems } = await import("../src/utils/bulkImport.js");

  const uploaded = normalizeBulkUploadItems([{ id: "1", title_en: "Old JSON" }]);
  assert.equal(uploaded.items[0].title_native, "");

  const stored = parseStoredBulkItems(JSON.stringify([{ id: "2", title_romaji: "Stored" }]));
  assert.equal(stored[0].title_native, "");
});

test("stripBulkMetadata removes frontend-only import state recursively", () => {
  assert.deepEqual(
    stripBulkMetadata({
      id: "52991",
      title_en: "Frieren",
      title_native: "葬送のフリーレン",
      is_reviewed: true,
      import_status: "imported",
      episodes: [{ id: "episode-db-id", episode_number: 1, links: [{ id: "link-db-id", embed_url: "x" }] }],
      characters: [
        {
          id: "character-db-id",
          name: "Frieren",
          voice_actors: [{ id: "voice-db-id", name: "Atsumi" }],
        },
      ],
    }),
    {
      id: "52991",
      title_en: "Frieren",
      title_native: "葬送のフリーレン",
      episodes: [{ episode_number: 1, links: [{ embed_url: "x" }] }],
      characters: [{ name: "Frieren", voice_actors: [{ name: "Atsumi" }] }],
    },
  );
});
