import {
  isValidEpisodeAiredAt,
  normalizeEpisodeAiredAt,
} from "./episodeDate.js";

export const EPISODE_LINK_IMPORT_STRATEGY = {
  MERGE: "merge",
  REPLACE_IMPORTED: "replace_imported",
};

export const EPISODE_LINK_IMPORT_MAX_SIZE = 1024 * 1024;

export function parseEpisodeLinksJson(fileText) {
  let parsed;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    return failure(["JSON syntax error."]);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return failure(["The JSON root must be a non-empty array of episodes."]);
  }

  const errors = [];
  const warnings = [];
  const byEpisodeNumber = new Map();
  let duplicateEpisodesMerged = 0;
  let duplicateLinksRemoved = 0;

  parsed.forEach((item, index) => {
    const episodeNumber = normalizeEpisodeNumber(item?.episode_number);
    if (episodeNumber === null) {
      errors.push(
        `Episode item ${index + 1}: episode_number must be a positive integer.`,
      );
      return;
    }

    if (!Array.isArray(item?.links)) {
      errors.push(`Episode ${episodeNumber}: links must be an array.`);
      return;
    }

    const linkResult = normalizeLinks(item.links, episodeNumber, errors);
    duplicateLinksRemoved += linkResult.duplicateLinksRemoved;
    if (item.links.length === 0) {
      errors.push(
        `Episode ${episodeNumber}: links must contain at least one valid link.`,
      );
    }

    const thumbnailUrl = normalizeThumbnailUrl(
      item?.thumbnail_url,
      episodeNumber,
      warnings,
    );
    if (!isValidEpisodeAiredAt(item?.aired_at)) {
      errors.push(
        `Episode ${episodeNumber}: aired_at must be a valid ISO 8601 date string or null.`,
      );
      return;
    }
    const airedAt = normalizeEpisodeAiredAt(item?.aired_at);
    const existing = byEpisodeNumber.get(episodeNumber);
    if (existing) duplicateEpisodesMerged += 1;
    const merged = existing || {
      episode_number: episodeNumber,
      aired_at: null,
      thumbnail_url: null,
      links: [],
    };

    if (!merged.aired_at && airedAt) merged.aired_at = airedAt;
    if (!merged.thumbnail_url && thumbnailUrl)
      merged.thumbnail_url = thumbnailUrl;
    const seenLinks = new Set(merged.links.map((link) => link.embed_url));
    linkResult.links.forEach((link) => {
      if (seenLinks.has(link.embed_url)) {
        duplicateLinksRemoved += 1;
        return;
      }
      seenLinks.add(link.embed_url);
      merged.links.push(link);
    });
    byEpisodeNumber.set(episodeNumber, merged);
  });

  if (errors.length) return failure(errors, warnings);

  const episodes = [...byEpisodeNumber.values()].sort(
    (a, b) => a.episode_number - b.episode_number,
  );

  return {
    ok: true,
    episodes,
    errors: [],
    warnings,
    summary: {
      duplicateEpisodesMerged,
      duplicateLinksRemoved,
    },
  };
}

export function mergeEpisodeLinks({
  currentEpisodes = [],
  currentEpisodeTotal = null,
  importedEpisodes = [],
  strategy = EPISODE_LINK_IMPORT_STRATEGY.MERGE,
}) {
  const currentByNumber = new Map(
    currentEpisodes
      .filter((episode) => Number.isInteger(Number(episode?.episode_number)))
      .map((episode) => [
        Number(episode.episode_number),
        cloneEpisode(episode),
      ]),
  );

  importedEpisodes.forEach((importedEpisode) => {
    const episodeNumber = importedEpisode.episode_number;
    const currentEpisode = currentByNumber.get(episodeNumber);
    const importedClone = cloneEpisode(importedEpisode);

    if (!currentEpisode) {
      currentByNumber.set(episodeNumber, importedClone);
      return;
    }

    if (strategy === EPISODE_LINK_IMPORT_STRATEGY.REPLACE_IMPORTED) {
      currentByNumber.set(episodeNumber, {
        episode_number: episodeNumber,
        aired_at: importedClone.aired_at || currentEpisode.aired_at || null,
        thumbnail_url:
          importedClone.thumbnail_url || currentEpisode.thumbnail_url || null,
        links: importedClone.links,
      });
      return;
    }

    const seenLinks = new Set(
      currentEpisode.links.map((link) => link.embed_url),
    );
    const nextLinks = [...currentEpisode.links];
    importedClone.links.forEach((link) => {
      if (!seenLinks.has(link.embed_url)) {
        seenLinks.add(link.embed_url);
        nextLinks.push(link);
      }
    });
    currentByNumber.set(episodeNumber, {
      episode_number: episodeNumber,
      aired_at: currentEpisode.aired_at || importedClone.aired_at || null,
      thumbnail_url:
        currentEpisode.thumbnail_url || importedClone.thumbnail_url || null,
      links: nextLinks,
    });
  });

  const episodes = [...currentByNumber.values()].sort(
    (a, b) => Number(a.episode_number) - Number(b.episode_number),
  );
  const highestEpisodeNumber = Math.max(
    0,
    ...episodes.map((episode) => Number(episode.episode_number) || 0),
  );
  const currentTotal =
    Number.isInteger(Number(currentEpisodeTotal)) &&
    Number(currentEpisodeTotal) > 0
      ? Number(currentEpisodeTotal)
      : null;

  return {
    episodes,
    episode_total:
      currentTotal === null
        ? highestEpisodeNumber || null
        : Math.max(currentTotal, highestEpisodeNumber),
  };
}

export function calculateEpisodeImportSummary({
  currentEpisodes = [],
  importedEpisodes = [],
  duplicateEpisodesMerged = 0,
  duplicateLinksRemoved = 0,
}) {
  const currentNumbers = new Set(
    currentEpisodes
      .map((episode) => Number(episode?.episode_number))
      .filter((number) => Number.isInteger(number) && number > 0),
  );
  const importedNumbers = importedEpisodes.map(
    (episode) => episode.episode_number,
  );

  return {
    episodesFound: importedEpisodes.length,
    streamingLinksFound: importedEpisodes.reduce(
      (total, episode) => total + episode.links.length,
      0,
    ),
    duplicateEpisodesMerged,
    duplicateLinksRemoved,
    newEpisodesToCreate: importedNumbers.filter(
      (number) => !currentNumbers.has(number),
    ).length,
    existingEpisodesToUpdate: importedNumbers.filter((number) =>
      currentNumbers.has(number),
    ).length,
    highestEpisodeNumber: Math.max(0, ...importedNumbers),
  };
}

function failure(errors, warnings = []) {
  return {
    ok: false,
    episodes: [],
    errors,
    warnings,
    summary: {
      duplicateEpisodesMerged: 0,
      duplicateLinksRemoved: 0,
    },
  };
}

function normalizeEpisodeNumber(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === "string" && /^[1-9]\d*$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
}

function normalizeLinks(links, episodeNumber, errors) {
  const seen = new Set();
  const normalized = [];
  let duplicateLinksRemoved = 0;

  links.forEach((link, index) => {
    const embedUrl =
      typeof link?.embed_url === "string" ? link.embed_url.trim() : "";
    // if (!isHttpUrl(embedUrl)) {
    //   errors.push(
    //     `Episode ${episodeNumber}, link ${index + 1}: embed_url must be a valid HTTP or HTTPS URL.`,
    //   );
    //   return;
    // }
    if (!seen.has(embedUrl)) {
      seen.add(embedUrl);
      normalized.push({ embed_url: embedUrl });
    } else {
      duplicateLinksRemoved += 1;
    }
  });

  return { links: normalized, duplicateLinksRemoved };
}

function normalizeThumbnailUrl(value, episodeNumber, warnings) {
  if (value === null || value === undefined) return null;
  const thumbnailUrl = String(value).trim();
  if (!thumbnailUrl) return null;
  if (isHttpUrl(thumbnailUrl)) return thumbnailUrl;
  warnings.push(
    `Episode ${episodeNumber}: thumbnail_url was ignored because it is not a valid HTTP or HTTPS URL.`,
  );
  return null;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function cloneEpisode(episode) {
  return {
    episode_number: Number(episode.episode_number),
    aired_at: normalizeEpisodeAiredAt(episode?.aired_at),
    thumbnail_url: episode.thumbnail_url || null,
    links: Array.isArray(episode.links)
      ? episode.links
          .map((link) => ({
            embed_url:
              typeof link?.embed_url === "string" ? link.embed_url.trim() : "",
          }))
          .filter((link) => link.embed_url)
      : [],
  };
}
