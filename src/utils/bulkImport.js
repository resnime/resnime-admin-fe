import {
  isValidEpisodeAiredAt,
  normalizeEpisodeAiredAt,
} from "./episodeDate.js";

export const BULK_STORAGE_KEY = "resnime_admin_bulk_items_v1";

export const emptyBulkAnime = {
  id: "",
  title_en: "",
  title_native: "",
  title_romaji: "",
  photo: "",
  rating: 0,
  status: "Ongoing",
  aired: "",
  season: "",
  type: "",
  studio: "",
  description: "",
  banner_bg_img: "",
  genres: [],
  episode_total: null,
  episodes: [],
  characters: [],
};

export function normalizeBulkUploadItems(uploadedItems, existingItems = []) {
  const existingById = new Map(
    existingItems.map((item) => [String(item.id), item]),
  );
  const uploadedIds = new Set();
  const nextById = new Map(existingById);
  const skipped = [];
  const summary = {
    added: 0,
    updated: 0,
    reviewedSkipped: 0,
    invalidSkipped: 0,
    duplicateSkipped: 0,
  };

  uploadedItems.forEach((rawItem, index) => {
    const id = normalizeMalId(rawItem?.id);
    if (!id) {
      summary.invalidSkipped += 1;
      skipped.push({ index, anime_id: null, reason: "MAL ID is invalid" });
      return;
    }

    if (uploadedIds.has(id)) {
      summary.duplicateSkipped += 1;
      skipped.push({ index, anime_id: id, reason: "Duplicate MAL ID in file" });
      return;
    }
    uploadedIds.add(id);

    const existing = existingById.get(id);
    if (existing?.is_reviewed === true) {
      summary.reviewedSkipped += 1;
      skipped.push({ index, anime_id: id, reason: "Reviewed item was kept" });
      return;
    }

    const airedAtError = findEpisodeAiredAtError(rawItem);
    if (airedAtError) {
      summary.invalidSkipped += 1;
      skipped.push({ index, anime_id: id, reason: airedAtError });
      return;
    }

    const normalized = {
      ...normalizeAnime(rawItem),
      id,
      is_reviewed: false,
      import_status: normalizeImportStatus(existing?.import_status),
    };

    nextById.set(id, normalized);
    summary[existing ? "updated" : "added"] += 1;
  });

  return { items: [...nextById.values()], summary, skipped };
}

export function parseStoredBulkItems(value) {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeBulkItem(item))
      .filter((item) => item.id);
  } catch {
    return [];
  }
}

export function normalizeBulkItem(item) {
  const anime = normalizeAnime(item);
  return {
    ...anime,
    id: normalizeMalId(item?.id),
    anilist_id: item?.anilist_id || null,
    is_reviewed: item?.is_reviewed === true,
    import_status: normalizeImportStatus(item?.import_status),
  };
}

export function stripBulkMetadata(anime) {
  const payload = stripInternalKeys(anime, true);
  delete payload.is_reviewed;
  delete payload.import_status;
  return payload;
}

function normalizeAnime(item) {
  const source = item && typeof item === "object" ? item : {};
  return {
    ...emptyBulkAnime,
    id: normalizeMalId(source.id),
    title_en: normalizeString(source.title_en),
    title_native: normalizeString(source.title_native),
    title_romaji: normalizeString(source.title_romaji),
    photo: normalizeString(source.photo),
    rating:
      typeof source.rating === "number" && Number.isFinite(source.rating)
        ? source.rating
        : 0,
    status: normalizeString(source.status) || "Ongoing",
    aired: normalizeString(source.aired),
    season: normalizeString(source.season),
    type: normalizeString(source.type),
    studio: normalizeString(source.studio),
    description: normalizeString(source.description),
    banner_bg_img: normalizeString(source.banner_bg_img),
    genres: Array.isArray(source.genres)
      ? source.genres.filter((genre) => typeof genre === "string")
      : [],
    episode_total:
      typeof source.episode_total === "number" &&
      Number.isFinite(source.episode_total)
        ? source.episode_total
        : null,
    episodes: Array.isArray(source.episodes)
      ? source.episodes.map(normalizeEpisode)
      : [],
    characters: Array.isArray(source.characters)
      ? source.characters.map(normalizeCharacter)
      : [],
  };
}

function normalizeEpisode(episode) {
  return {
    episode_number: Number.isInteger(Number(episode?.episode_number))
      ? Number(episode.episode_number)
      : null,
    aired_at: normalizeEpisodeAiredAt(episode?.aired_at),
    thumbnail_url: normalizeNullableString(episode?.thumbnail_url),
    links: Array.isArray(episode?.links)
      ? episode.links.map(normalizeEpisodeLink).filter((link) => link.embed_url)
      : [],
  };
}

function findEpisodeAiredAtError(item) {
  if (!Array.isArray(item?.episodes)) return null;

  for (const [index, episode] of item.episodes.entries()) {
    if (!isValidEpisodeAiredAt(episode?.aired_at)) {
      return `Episode ${index + 1}: aired_at must be a valid ISO 8601 date string or null`;
    }
  }

  return null;
}

function normalizeEpisodeLink(link) {
  return { embed_url: normalizeString(link?.embed_url) };
}

function normalizeCharacter(character) {
  return {
    name: normalizeString(character?.name),
    photo: normalizeString(character?.photo),
    role: normalizeString(character?.role) || "Main",
    voice_actors: Array.isArray(character?.voice_actors)
      ? character.voice_actors.map(normalizeVoiceActor)
      : [],
  };
}

function normalizeVoiceActor(actor) {
  return {
    name: normalizeString(actor?.name),
    photo: normalizeString(actor?.photo),
    country: normalizeString(actor?.country) || "Japan",
  };
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableString(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
}

function normalizeMalId(value) {
  const id = String(value ?? "").trim();
  return /^[1-9]\d*$/.test(id) ? id : "";
}

function normalizeImportStatus(value) {
  return value === "imported" || value === "failed" ? value : null;
}

function stripInternalKeys(value, isRoot = false) {
  if (Array.isArray(value)) return value.map((item) => stripInternalKeys(item));
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => {
        if (key === "is_reviewed" || key === "import_status" || key === "key")
          return false;
        if (!isRoot && key === "id") return false;
        return true;
      })
      .map(([key, child]) => [key, stripInternalKeys(child)]),
  );
}
