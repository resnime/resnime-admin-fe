export const getAssetUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("/")) {
    return `https://assets.resaeni.cc${url}`;
  }
  return url;
};
