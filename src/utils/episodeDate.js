const ISO_DATE_TIME_WITH_ZONE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

export function normalizeEpisodeAiredAt(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!isValidEpisodeAiredAt(trimmed)) return null;
  return new Date(trimmed).toISOString().replace(".000Z", "Z");
}

export function isValidEpisodeAiredAt(value) {
  if (value === null || value === undefined) return true;
  if (typeof value !== "string") return false;
  if (!value.trim()) return true;

  const match = ISO_DATE_TIME_WITH_ZONE.exec(value.trim());
  if (!match) return false;

  const [, year, month, day, hour, minute, second, zone] = match;
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);
  const secondNumber = Number(second);

  if (monthNumber < 1 || monthNumber > 12) return false;
  if (dayNumber < 1 || dayNumber > daysInMonth(Number(year), monthNumber)) return false;
  if (hourNumber > 23 || minuteNumber > 59 || secondNumber > 59) return false;
  if (!isValidZone(zone)) return false;

  return !Number.isNaN(Date.parse(value));
}

export function normalizeAnimeEpisodeDates(anime) {
  return {
    ...anime,
    episodes: Array.isArray(anime?.episodes)
      ? anime.episodes.map((episode) => ({
          ...episode,
          aired_at: normalizeEpisodeAiredAt(episode?.aired_at),
        }))
      : [],
  };
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isValidZone(zone) {
  if (zone === "Z") return true;
  const [, hour, minute] = /^([+-]\d{2}):(\d{2})$/.exec(zone) || [];
  return Number(hour.slice(1)) <= 23 && Number(minute) <= 59;
}
