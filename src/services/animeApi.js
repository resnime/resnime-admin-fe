const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function scrapeAnime(malId) {
  const response = await fetch(`${API_BASE_URL}/api/scrape/anime`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ malId }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "Failed to scrape anime.");
  }

  return payload;
}

export async function fetchAnimeFromTurso(malId) {
  const response = await fetch(
    `${API_BASE_URL}/api/anime/${encodeURIComponent(String(malId))}`,
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const error = new Error(
      payload?.error?.message || "Failed to fetch anime from Turso.",
    );
    error.details = payload?.error?.details || [];
    throw error;
  }

  return payload;
}

export async function submitAnimeToTurso(anime) {
  const response = await fetch(`${API_BASE_URL}/api/anime/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(anime),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const error = new Error(
      payload?.error?.message || "Failed to submit anime to Turso.",
    );
    error.details = payload?.error?.details || [];
    throw error;
  }

  return payload;
}

