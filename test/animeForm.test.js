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

test("Episode editor exposes local episode link JSON import", async () => {
  const episodeEditor = await readFile(
    new URL("../src/components/EpisodeEditor.jsx", import.meta.url),
    "utf8",
  );

  assert.match(episodeEditor, /Import Episode Links JSON/);
  assert.match(episodeEditor, /Upload\.Dragger/);
  assert.match(episodeEditor, /beforeUpload/);
  assert.match(episodeEditor, /form\.setFieldsValue\(\{\s*episodes: merged\.episodes,\s*episode_total: merged\.episode_total,/);
  assert.doesNotMatch(episodeEditor, /submitAnimeToTurso|bulkUpsertAnime|localStorage/);
});

test("preview only updates from the fixed update preview button", async () => {
  const [app, animeForm] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/AnimeForm.jsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(app, /onValuesChange/);
  assert.match(app, /fixed-form-actions/);
  assert.match(app, /setPreviewAnime\(normalizeAnimeEpisodeDates\(animeForm\.getFieldsValue\(true\)\)\)/);
  assert.match(animeForm, /label="Native Title" name="title_native"/);
  assert.match(animeForm, /English Title[\s\S]*Native Title[\s\S]*Romaji Title/);
  assert.doesNotMatch(animeForm, /Update Preview/);
});
