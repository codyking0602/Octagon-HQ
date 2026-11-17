/**
 * Only reuse independently reviewed UFC prep from the exact current event.
 * Safe for both numbered events and Fight Nights; canonical bout IDs may change.
 */
function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

export function selectPreparedPickSpotlight(
  rows: unknown,
  event: Record<string, unknown>,
  bout: Record<string, unknown>,
): Record<string, unknown> | null {
  const start = typeof event.starts_at === "string" ? Date.parse(event.starts_at) : NaN;
  if (!Number.isFinite(start) || !Array.isArray(rows)) return null;
  const sourceKey = typeof event.source_event_key === "string" ? event.source_event_key : "";
  const sourceUrl = typeof event.source_url === "string" ? event.source_url.replace(/\/+$/, "") : "";
  const redSlug = bout.red_fighter_slug;
  const blueSlug = bout.blue_fighter_slug;
  if (typeof redSlug !== "string" || typeof blueSlug !== "string") return null;

  const matching: Record<string, unknown>[] = [];
  for (const item of rows) {
    const prep = record(item);
    if (!prep || typeof prep.starts_at !== "string") continue;
    const prepStart = Date.parse(prep.starts_at);
    if (!Number.isFinite(prepStart) || Math.abs(prepStart - start) >= 6 * 60 * 60 * 1000) continue;
    if (sourceKey && prep.source_event_key !== sourceKey) continue;
    if (sourceUrl && (typeof prep.source_url !== "string"
      || prep.source_url.replace(/\/+$/, "") !== sourceUrl)) continue;
    const payload = record(prep.payload);
    const candidates = Array.isArray(payload?.spotlights) ? payload.spotlights : [];
    for (const value of candidates) {
      const spotlight = record(value);
      const red = record(spotlight?.red);
      const blue = record(spotlight?.blue);
      if (spotlight?.source !== "UFCStats" || red?.fighter_slug !== redSlug
        || blue?.fighter_slug !== blueSlug
        || typeof spotlight.preview !== "string" || spotlight.preview.trim().length < 20
        || typeof spotlight.generated_at !== "string" || spotlight.generated_at.length < 10) continue;
      matching.push(spotlight);
    }
  }
  // Ambiguous packages cannot be auto-selected; retain the verified fallback.
  return matching.length === 1 ? matching[0]! : null;
}
