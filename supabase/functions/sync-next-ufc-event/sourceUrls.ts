const MMA_MANIA_INDEX_URL = "https://www.mmamania.com/ufc-fight-cards";

export function absoluteMmaManiaArticleUrl(value: string) {
  try {
    const url = new URL(value, MMA_MANIA_INDEX_URL);
    const isMmaMania = url.hostname === "mmamania.com" || url.hostname === "www.mmamania.com";
    return isMmaMania && url.pathname !== "/ufc-fight-cards" ? url.toString() : "";
  } catch {
    return "";
  }
}
