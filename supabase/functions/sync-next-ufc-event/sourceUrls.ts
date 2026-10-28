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

export function absoluteUfcEventsUrl(value: string) {
  try {
    const url = new URL(value, UFC_ORIGIN);
    const path = url.pathname.replace(/\/+$/, "");
    if (
      url.protocol !== "https:"
      || !/^(?:www\.)?ufc\.com$/i.test(url.hostname)
      || path !== "/events"
    ) {
      return "";
    }
    const page = url.searchParams.get("page");
    if (page !== null && !/^\d{1,2}$/.test(page)) return "";
    for (const key of [...url.searchParams.keys()]) {
      if (key !== "page") url.searchParams.delete(key);
    }
    url.protocol = "https:";
    url.hostname = "www.ufc.com";
    url.pathname = "/events";
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

export function isLegacyEventSourceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (
      url.hostname === "www.mmamania.com"
      || url.hostname === "www.cbssports.com"
    );
  } catch {
    return false;
  }
}

export function resolveUfcSourcePreference(supplied: string, saved: string) {
  const suppliedValue = supplied.trim();
  const savedValue = saved.trim();
  const suppliedUfc = absoluteUfcEventUrl(suppliedValue);
  const savedUfc = absoluteUfcEventUrl(savedValue);
  const suppliedMatchesSaved = Boolean(suppliedValue && savedValue && suppliedValue === savedValue);
  const acceptedSavedLegacyValue = suppliedMatchesSaved && isLegacyEventSourceUrl(savedValue);
  return {
    invalidExplicitSource: Boolean(
      suppliedValue
      && !suppliedUfc
      && !acceptedSavedLegacyValue,
    ),
    preferredSourceUrl: suppliedUfc
      || ((!suppliedValue || suppliedMatchesSaved) ? savedUfc : ""),
    suppliedMatchesSaved,
  };
}
