/**
 * A source refresh must never erase an already verified place from the
 * exact same staged UFC event just because UFC.com omits the city today.
 * Do not copy a location between different events, venues or dates.
 */
export interface EventPlaceIdentity {
  source_event_key: string;
  source_url: string;
  venue: string;
  location: string;
  starts_at: string;
}

export function matchingStagedEventLocation(event: EventPlaceIdentity, current: unknown): string {
  if (event.location || !current || typeof current !== "object" || Array.isArray(current)) return "";
  const saved = current as Record<string, unknown>;
  if (saved.state !== "staged"
    || saved.source_event_key !== event.source_event_key
    || saved.source_url !== event.source_url
    || saved.venue !== event.venue) return "";
  const currentStart = typeof saved.starts_at === "string" ? Date.parse(saved.starts_at) : NaN;
  const eventStart = Date.parse(event.starts_at);
  if (!Number.isFinite(currentStart) || !Number.isFinite(eventStart)
    || Math.abs(currentStart - eventStart) > 60 * 1000) return "";
  const location = typeof saved.location === "string" ? saved.location.trim() : "";
  return location.length >= 3 && location.length <= 100 && !/[<>]/.test(location) ? location : "";
}
