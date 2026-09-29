export type TriviaContentType = "evergreen" | "current-event";

export interface TriviaContentWindow {
  contentType: TriviaContentType;
  activeFrom?: string;
  expiresAt?: string;
}

function normalizedDate(value: Date | string | undefined) {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Canonical trivia freshness gate.
 *
 * Current-event content may opt into an inclusive active window through the
 * same activeFrom/expiresAt metadata used by Bar Trivia. Evergreen content is
 * always eligible.
 */
export function isTriviaContentActive(
  content: TriviaContentWindow,
  now: Date | string = new Date(),
) {
  if (content.contentType !== "current-event") return true;
  const at = normalizedDate(now).getTime();
  const starts = content.activeFrom
    ? new Date(content.activeFrom).getTime()
    : Number.NEGATIVE_INFINITY;
  const expires = content.expiresAt
    ? new Date(content.expiresAt).getTime()
    : Number.POSITIVE_INFINITY;
  return at >= starts && at <= expires;
}
