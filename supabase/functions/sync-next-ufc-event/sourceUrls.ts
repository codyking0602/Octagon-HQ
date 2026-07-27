const MMA_MANIA_INDEX_URL = "https://www.mmamania.com/ufc-fight-cards";

// MMA Mania indexes may link to dated article paths instead of /ufc-fight-cards/ paths.
export function absoluteMmaManiaArticleUrl(value: string) {
  try {
    const url = new URL(value, MMA_MANIA_INDEX_URL);
    const isMmaMania = url.hostname === "mmamania.com" || url.hostname === "www.mmamania.com";
    const segments = url.pathname.split("/").filter(Boolean);
    const indexOrUtility = segments.length < 2
      || ["ufc-fight-cards", "search", "auth", "users", "pages", "archives"].includes(segments.at(-1) ?? "")
      || segments.some((segment) => ["search", "auth", "users", "pages"].includes(segment));
    return isMmaMania && !indexOrUtility ? url.toString() : "";
  } catch {
    return "";
  }
}
