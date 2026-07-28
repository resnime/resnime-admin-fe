import { normalizeEpisodeAiredAt } from "./episodeDate.js";

export function createEmptyEpisode(episodeNumber) {
  return {
    episode_number: episodeNumber,
    aired_at: null,
    thumbnail_url: null,
    links: [],
  };
}

export function mergeEpisodeRange(currentEpisodes = [], start, end) {
  const startEpisode = Number(start);
  const endEpisode = Number(end);

  if (
    !Number.isInteger(startEpisode) ||
    !Number.isInteger(endEpisode) ||
    startEpisode <= 0 ||
    endEpisode <= 0
  ) {
    throw new Error("Episode range must use positive numbers.");
  }
  if (endEpisode < startEpisode) {
    throw new Error("End episode cannot be smaller than start episode.");
  }

  const byNumber = new Map(
    currentEpisodes
      .filter((episode) => Number.isInteger(Number(episode?.episode_number)))
      .map((episode) => [Number(episode.episode_number), episode]),
  );

  for (
    let episodeNumber = startEpisode;
    episodeNumber <= endEpisode;
    episodeNumber += 1
  ) {
    if (!byNumber.has(episodeNumber)) {
      byNumber.set(episodeNumber, createEmptyEpisode(episodeNumber));
    }
  }

  return [...byNumber.values()].map(normalizeEpisode).sort(
    (a, b) => Number(a.episode_number) - Number(b.episode_number),
  );
}

export function normalizeEpisode(episode) {
  return {
    ...episode,
    episode_number: Number(episode.episode_number),
    aired_at: normalizeEpisodeAiredAt(episode?.aired_at),
    thumbnail_url: episode?.thumbnail_url || null,
    links: Array.isArray(episode?.links) ? episode.links : [],
  };
}
