import test from "node:test";
import assert from "node:assert/strict";
import {
  EPISODE_LINK_IMPORT_STRATEGY,
  calculateEpisodeImportSummary,
  mergeEpisodeLinks,
  parseEpisodeLinksJson,
} from "../src/utils/episodeLinksJson.js";

test("parseEpisodeLinksJson rejects invalid roots and malformed JSON", () => {
  assert.equal(parseEpisodeLinksJson('{"episodes":[]}').ok, false);
  assert.match(parseEpisodeLinksJson('{"episodes":[]}').errors[0], /non-empty array/);
  assert.equal(parseEpisodeLinksJson("[]").ok, false);
  assert.equal(parseEpisodeLinksJson("{").ok, false);
});

test("parseEpisodeLinksJson normalizes episode numbers, URLs, thumbnails, duplicates, and order", () => {
  const result = parseEpisodeLinksJson(
    JSON.stringify([
      {
        episode_number: "2",
        thumbnail_url: "",
        links: [
          { embed_url: " https://example.com/embed/episode-2?x=1 " },
          { embed_url: "https://example.com/embed/episode-2?x=1" },
        ],
      },
      {
        episode_number: 1,
        thumbnail_url: "https://example.com/thumb-1.jpg",
        links: [{ embed_url: "http://example.com/embed/episode-1" }],
      },
      {
        episode_number: 2,
        thumbnail_url: "https://example.com/thumb-2.jpg",
        links: [{ embed_url: "https://backup.example.com/embed/episode-2" }],
      },
      {
        episode_number: 1,
        links: [{ embed_url: "http://example.com/embed/episode-1" }],
      },
    ]),
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.episodes, [
    {
      episode_number: 1,
      thumbnail_url: "https://example.com/thumb-1.jpg",
      links: [{ embed_url: "http://example.com/embed/episode-1" }],
    },
    {
      episode_number: 2,
      thumbnail_url: "https://example.com/thumb-2.jpg",
      links: [
        { embed_url: "https://example.com/embed/episode-2?x=1" },
        { embed_url: "https://backup.example.com/embed/episode-2" },
      ],
    },
  ]);
  assert.equal(result.summary.duplicateEpisodesMerged, 2);
  assert.equal(result.summary.duplicateLinksRemoved, 2);
});

test("parseEpisodeLinksJson rejects invalid episode numbers, link arrays, and URL protocols", () => {
  const result = parseEpisodeLinksJson(
    JSON.stringify([
      { episode_number: 1.5, links: [{ embed_url: "https://example.com/1" }] },
      { episode_number: "Episode 2", links: [{ embed_url: "https://example.com/2" }] },
      { episode_number: 3, links: [] },
      { episode_number: 4, links: [{ embed_url: "javascript:alert(1)" }] },
      { episode_number: 5, links: [{ embed_url: "/relative" }] },
    ]),
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 5);
});

test("parseEpisodeLinksJson keeps valid episodes when thumbnail warning falls back to null", () => {
  const result = parseEpisodeLinksJson(
    JSON.stringify([
      {
        episode_number: 1,
        thumbnail_url: "ftp://example.com/thumb.jpg",
        links: [{ embed_url: "https://example.com/embed/episode-1" }],
      },
    ]),
  );

  assert.equal(result.ok, true);
  assert.equal(result.episodes[0].thumbnail_url, null);
  assert.match(result.warnings[0], /thumbnail_url/);
});

test("mergeEpisodeLinks merges without mutating inputs and updates episode_total upward only", () => {
  const currentEpisodes = [
    {
      episode_number: 2,
      thumbnail_url: "https://example.com/current-thumb.jpg",
      links: [{ embed_url: "https://existing.example/2" }],
    },
  ];
  const importedEpisodes = [
    {
      episode_number: 1,
      thumbnail_url: null,
      links: [{ embed_url: "https://new.example/1" }],
    },
    {
      episode_number: 2,
      thumbnail_url: "https://example.com/imported-thumb.jpg",
      links: [
        { embed_url: "https://existing.example/2" },
        { embed_url: "https://new.example/2" },
      ],
    },
  ];
  const currentSnapshot = structuredClone(currentEpisodes);
  const importedSnapshot = structuredClone(importedEpisodes);

  const result = mergeEpisodeLinks({
    currentEpisodes,
    currentEpisodeTotal: 1,
    importedEpisodes,
    strategy: EPISODE_LINK_IMPORT_STRATEGY.MERGE,
  });

  assert.deepEqual(currentEpisodes, currentSnapshot);
  assert.deepEqual(importedEpisodes, importedSnapshot);
  assert.equal(result.episode_total, 2);
  assert.deepEqual(result.episodes, [
    {
      episode_number: 1,
      thumbnail_url: null,
      links: [{ embed_url: "https://new.example/1" }],
    },
    {
      episode_number: 2,
      thumbnail_url: "https://example.com/current-thumb.jpg",
      links: [
        { embed_url: "https://existing.example/2" },
        { embed_url: "https://new.example/2" },
      ],
    },
  ]);

  const lowerResult = mergeEpisodeLinks({
    currentEpisodes: result.episodes,
    currentEpisodeTotal: 12,
    importedEpisodes,
    strategy: EPISODE_LINK_IMPORT_STRATEGY.MERGE,
  });
  assert.equal(lowerResult.episode_total, 12);
});

test("mergeEpisodeLinks replaces only imported episode links and preserves unrelated episodes and thumbnails", () => {
  const result = mergeEpisodeLinks({
    currentEpisodeTotal: 3,
    currentEpisodes: [
      {
        episode_number: 1,
        thumbnail_url: "https://example.com/keep-thumb.jpg",
        links: [{ embed_url: "https://old.example/1" }],
      },
      {
        episode_number: 3,
        thumbnail_url: null,
        links: [{ embed_url: "https://old.example/3" }],
      },
    ],
    importedEpisodes: [
      {
        episode_number: 1,
        thumbnail_url: null,
        links: [{ embed_url: "https://new.example/1" }],
      },
    ],
    strategy: EPISODE_LINK_IMPORT_STRATEGY.REPLACE_IMPORTED,
  });

  assert.equal(result.episode_total, 3);
  assert.deepEqual(result.episodes, [
    {
      episode_number: 1,
      thumbnail_url: "https://example.com/keep-thumb.jpg",
      links: [{ embed_url: "https://new.example/1" }],
    },
    {
      episode_number: 3,
      thumbnail_url: null,
      links: [{ embed_url: "https://old.example/3" }],
    },
  ]);
});

test("calculateEpisodeImportSummary reflects strategy-sensitive creates and updates", () => {
  const summary = calculateEpisodeImportSummary({
    currentEpisodes: [{ episode_number: 1, thumbnail_url: null, links: [] }],
    importedEpisodes: [
      { episode_number: 1, thumbnail_url: null, links: [{ embed_url: "https://example.com/1" }] },
      { episode_number: 2, thumbnail_url: null, links: [{ embed_url: "https://example.com/2" }] },
    ],
    duplicateEpisodesMerged: 1,
    duplicateLinksRemoved: 2,
  });

  assert.deepEqual(summary, {
    episodesFound: 2,
    streamingLinksFound: 2,
    duplicateEpisodesMerged: 1,
    duplicateLinksRemoved: 2,
    newEpisodesToCreate: 1,
    existingEpisodesToUpdate: 1,
    highestEpisodeNumber: 2,
  });
});
