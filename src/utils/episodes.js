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
      byNumber.set(episodeNumber, {
        episode_number: episodeNumber,
        thumbnail_url: null,
        links: [],
      });
    }
  }

  return [...byNumber.values()].sort(
    (a, b) => Number(a.episode_number) - Number(b.episode_number),
  );
}
