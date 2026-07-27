import { normalizeBulkItem } from "./bulkImport.js";

export const SCRAPE_MERGE_STRATEGY = {
  FILL_MISSING: "fill_missing",
  REPLACE_SCRAPED: "replace_scraped",
};

const MERGE_FIELDS = [
  "title_en",
  "title_native",
  "title_romaji",
  "photo",
  "rating",
  "status",
  "aired",
  "season",
  "type",
  "studio",
  "description",
  "banner_bg_img",
  "genres",
  "episode_total",
  "characters",
];

export function mergeScrapedAnimeData({
  currentData,
  scrapedData,
  strategy = SCRAPE_MERGE_STRATEGY.FILL_MISSING,
}) {
  const current = normalizeBulkItem(currentData);
  const scraped = normalizeBulkItem({ ...scrapedData, id: current.id });
  const merged = { ...current };

  if (strategy === SCRAPE_MERGE_STRATEGY.REPLACE_SCRAPED) {
    MERGE_FIELDS.forEach((field) => {
      if (!isEmptyScrapedValue(scraped[field], field)) merged[field] = scraped[field];
    });
    merged.episodes = mergeEpisodesForReplace(current, scraped);
  } else {
    [...MERGE_FIELDS, "episodes"].forEach((field) => {
      if (isEmptyCurrentValue(current[field], field) && !isEmptyScrapedValue(scraped[field], field)) {
        merged[field] = scraped[field];
      }
    });
  }

  return normalizeBulkItem({ ...merged, id: current.id });
}

export function willReplaceRemoveEpisodes(currentData, scrapedData) {
  const current = normalizeBulkItem(currentData);
  const scraped = normalizeBulkItem({ ...scrapedData, id: current.id });
  return (
    Number.isInteger(scraped.episode_total) &&
    scraped.episode_total > 0 &&
    current.episodes.some((episode) => episode.episode_number > scraped.episode_total)
  );
}

function isEmptyCurrentValue(value, field) {
  if (field === "rating") return value === 0 || value === "" || value === null || value === undefined;
  if (field === "episode_total") return value === null;
  if (Array.isArray(value)) return value.length === 0;
  return value === "" || value === null || value === undefined;
}

function isEmptyScrapedValue(value, field) {
  if (field === "rating") return value === "" || value === null || value === undefined;
  if (field === "episode_total") return !Number.isInteger(value) || value <= 0;
  if (Array.isArray(value)) return value.length === 0;
  return value === "" || value === null || value === undefined;
}

function mergeEpisodesForReplace(current, scraped) {
  if (!Number.isInteger(scraped.episode_total) || scraped.episode_total <= 0) {
    return current.episodes;
  }

  const currentByNumber = new Map(current.episodes.map((episode) => [episode.episode_number, episode]));
  const scrapedByNumber = new Map(scraped.episodes.map((episode) => [episode.episode_number, episode]));

  return Array.from({ length: scraped.episode_total }, (_, index) => {
    const episodeNumber = index + 1;
    const currentEpisode = currentByNumber.get(episodeNumber);
    const scrapedEpisode = scrapedByNumber.get(episodeNumber);
    if (!currentEpisode) {
      return scrapedEpisode || {
        episode_number: episodeNumber,
        thumbnail_url: null,
        links: [],
      };
    }

    return {
      episode_number: episodeNumber,
      thumbnail_url: currentEpisode.thumbnail_url || scrapedEpisode?.thumbnail_url || null,
      links: currentEpisode.links.length ? currentEpisode.links : scrapedEpisode?.links || [],
    };
  });
}
