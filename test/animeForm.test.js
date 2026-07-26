import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Anime form editors expose scroll wrappers", async () => {
  const [episodeEditor, characterEditor] = await Promise.all([
    readFile(new URL("../src/components/EpisodeEditor.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/CharacterEditor.jsx", import.meta.url), "utf8"),
  ]);

  assert.match(episodeEditor, /episode-editor-scroll/);
  assert.match(characterEditor, /character-editor-scroll/);
});

test("preview only updates from the fixed update preview button", async () => {
  const [app, animeForm] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/AnimeForm.jsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(app, /onValuesChange/);
  assert.match(app, /fixed-form-actions/);
  assert.match(app, /setPreviewAnime\(animeForm\.getFieldsValue\(true\)\)/);
  assert.doesNotMatch(animeForm, /Update Preview/);
});
