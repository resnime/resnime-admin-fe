import test from "node:test";
import assert from "node:assert/strict";
import {
  SCRAPE_MERGE_STRATEGY,
  mergeScrapedAnimeData,
} from "../src/utils/mergeScrapedAnimeData.js";

test("fill missing fields only fills empty values and keeps reviewed data", () => {
  const result = mergeScrapedAnimeData({
    strategy: SCRAPE_MERGE_STRATEGY.FILL_MISSING,
    currentData: {
      id: "52991",
      title_en: "Custom English Title",
      title_romaji: "",
      photo: "",
      rating: 0,
      genres: [],
      characters: [{ name: "Frieren", voice_actors: [] }],
      episode_total: null,
      episodes: [
        {
          episode_number: 1,
          thumbnail_url: "https://custom-thumbnail.jpg",
          links: [{ embed_url: "https://stream.example/episode-1" }],
        },
      ],
    },
    scrapedData: {
      id: "999",
      title_en: "Scraped English Title",
      title_romaji: "Sousou no Frieren",
      photo: "https://poster.example/frieren.jpg",
      rating: 9.3,
      genres: ["Adventure", "Drama"],
      characters: [{ name: "Fern", voice_actors: [] }],
      episode_total: 28,
      episodes: [{ episode_number: 1, thumbnail_url: null, links: [] }],
    },
  });

  assert.equal(result.id, "52991");
  assert.equal(result.title_en, "Custom English Title");
  assert.equal(result.title_romaji, "Sousou no Frieren");
  assert.equal(result.photo, "https://poster.example/frieren.jpg");
  assert.equal(result.rating, 9.3);
  assert.deepEqual(result.genres, ["Adventure", "Drama"]);
  assert.deepEqual(result.characters, [
    { name: "Frieren", photo: "", role: "Main", voice_actors: [] },
  ]);
  assert.equal(result.episode_total, 28);
  assert.deepEqual(result.episodes, [
    {
      episode_number: 1,
      thumbnail_url: "https://custom-thumbnail.jpg",
      links: [{ embed_url: "https://stream.example/episode-1" }],
    },
  ]);
});

test("fill missing fields uses nested scraped arrays when current arrays are empty", () => {
  const result = mergeScrapedAnimeData({
    strategy: SCRAPE_MERGE_STRATEGY.FILL_MISSING,
    currentData: { id: "21", genres: [], characters: [], episodes: [] },
    scrapedData: {
      genres: ["Action"],
      characters: [{ name: "Luffy", voice_actors: [] }],
      episodes: [{ episode_number: 1, thumbnail_url: null, links: [] }],
    },
  });

  assert.deepEqual(result.genres, ["Action"]);
  assert.deepEqual(result.characters, [
    { name: "Luffy", photo: "", role: "Main", voice_actors: [] },
  ]);
  assert.deepEqual(result.episodes, [
    { episode_number: 1, thumbnail_url: null, links: [] },
  ]);
});

test("replace scraped data keeps current values when scraped values are empty", () => {
  const result = mergeScrapedAnimeData({
    strategy: SCRAPE_MERGE_STRATEGY.REPLACE_SCRAPED,
    currentData: {
      id: "11061",
      title_en: "Hunter x Hunter",
      photo: "https://poster.example/hxh.jpg",
      genres: ["Adventure"],
      characters: [{ name: "Gon", voice_actors: [] }],
      episode_total: 148,
      episodes: [{ episode_number: 1, thumbnail_url: null, links: [] }],
    },
    scrapedData: {
      id: "999",
      title_en: "",
      photo: null,
      genres: [],
      characters: [],
      episode_total: null,
      episodes: [{ episode_number: 2, thumbnail_url: null, links: [] }],
    },
  });

  assert.equal(result.id, "11061");
  assert.equal(result.title_en, "Hunter x Hunter");
  assert.equal(result.photo, "https://poster.example/hxh.jpg");
  assert.deepEqual(result.genres, ["Adventure"]);
  assert.deepEqual(result.characters, [
    { name: "Gon", photo: "", role: "Main", voice_actors: [] },
  ]);
  assert.equal(result.episode_total, 148);
  assert.deepEqual(result.episodes, [
    { episode_number: 1, thumbnail_url: null, links: [] },
  ]);
});

test("replace scraped data replaces meaningful fields and preserves episode links by number", () => {
  const result = mergeScrapedAnimeData({
    strategy: SCRAPE_MERGE_STRATEGY.REPLACE_SCRAPED,
    currentData: {
      id: "52991",
      title_romaji: "Old Title",
      episode_total: 3,
      characters: [{ name: "Old Character", voice_actors: [] }],
      episodes: [
        {
          episode_number: 1,
          thumbnail_url: "https://custom-thumbnail.jpg",
          links: [{ embed_url: "https://stream.example/episode-1" }],
        },
        {
          episode_number: 3,
          thumbnail_url: null,
          links: [{ embed_url: "https://stream.example/episode-3" }],
        },
      ],
    },
    scrapedData: {
      title_romaji: "Sousou no Frieren",
      episode_total: 2,
      characters: [{ name: "Frieren", voice_actors: [] }],
      episodes: [
        {
          episode_number: 1,
          thumbnail_url: "https://scraped-thumbnail.jpg",
          links: [{ embed_url: "https://scraped.example/episode-1" }],
        },
        {
          episode_number: 2,
          thumbnail_url: "https://episode-2.jpg",
          links: [],
        },
      ],
    },
  });

  assert.equal(result.id, "52991");
  assert.equal(result.title_romaji, "Sousou no Frieren");
  assert.deepEqual(result.characters, [
    { name: "Frieren", photo: "", role: "Main", voice_actors: [] },
  ]);
  assert.equal(result.episode_total, 2);
  assert.deepEqual(result.episodes, [
    {
      episode_number: 1,
      thumbnail_url: "https://custom-thumbnail.jpg",
      links: [{ embed_url: "https://stream.example/episode-1" }],
    },
    { episode_number: 2, thumbnail_url: "https://episode-2.jpg", links: [] },
  ]);
});
