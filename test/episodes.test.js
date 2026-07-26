import test from "node:test";
import assert from "node:assert/strict";
import { mergeEpisodeRange } from "../src/utils/episodes.js";

test("mergeEpisodeRange appends missing episodes without duplicates and sorts ascending", () => {
  const result = mergeEpisodeRange([{ episode_number: 3, links: [] }], 1, 3);

  assert.deepEqual(
    result.map((episode) => episode.episode_number),
    [1, 2, 3],
  );
  assert.equal(result.find((episode) => episode.episode_number === 1).thumbnail_url, null);
});

test("mergeEpisodeRange rejects invalid ranges", () => {
  assert.throws(() => mergeEpisodeRange([], 0, 3), /positive/);
  assert.throws(() => mergeEpisodeRange([], 5, 3), /End episode/);
});
