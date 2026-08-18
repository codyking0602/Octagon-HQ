const UFC_ORIGIN = "https://www.ufc.com";

export function absoluteUfcEventUrl(value: string) {
  try {
    const url = new URL(value, UFC_ORIGIN);
    const path = url.pathname.replace(/\/+$/, "");
    if (
      url.protocol !== "https:"
      || !/^(?:www\.)?ufc\.com$/i.test(url.hostname)
      || !/^\/event\/[a-z0-9-]+$/i.test(path)
    ) {
      return "";
    }
    url.protocol = "https:";
    url.hostname = "www.ufc.com";
    url.pathname = path;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

export function canonicalUfcEventKey(value: string) {
  const sourceUrl = absoluteUfcEventUrl(value);
  if (!sourceUrl) return "";
  return new URL(sourceUrl).pathname.replace(/^\/+|\/+$/g, "");
}
