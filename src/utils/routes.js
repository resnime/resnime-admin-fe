export function getActiveMode(pathname) {
  return pathname.startsWith("/bulk") ? "bulk" : "manual";
}

export function getBulkReviewItem(items, animeId) {
  if (animeId === undefined || animeId === null) return null;
  return items.find((item) => String(item.id) === String(animeId)) || null;
}
