const MMA_MANIA_ORIGIN = "https://www.mmamania.com";
const CBS_SPORTS_ORIGIN = "https://www.cbssports.com";

export function absoluteMmaManiaArticleUrl(value: string) {
  try {
    const url = new URL(value, MMA_MANIA_ORIGIN);
    const normalizedPath = url.pathname.replace(/\/+$/, "");
    if (url.protocol !== "https:" || url.hostname !== "www.mmamania.com") return "";
    if (!normalizedPath || normalizedPath === "/ufc-fight-cards" || normalizedPath.endsWith("/archives")) return "";
    url.pathname = normalizedPath;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

export function absoluteCbsSportsUfcEventUrl(value: string) {
  try {
    const url = new URL(value, CBS_SPORTS_ORIGIN);
    const normalizedPath = url.pathname.replace(/\/+$/, "");
    if (url.protocol !== "https:" || url.hostname !== "www.cbssports.com") return "";
    if (!/^\/ufc\/event\/\d+\/[a-z0-9-]+$/i.test(normalizedPath)) return "";
    url.pathname = `${normalizedPath}/`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}
