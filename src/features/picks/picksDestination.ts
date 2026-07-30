export type PicksDestination =
  | { kind: "none" }
  | { kind: "archived-event"; eventId: string; recapRequested: boolean };

/**
 * Lets the existing Picks archive owner consume canonical event links.
 * The active card already owns the main Picks screen, so only archived
 * event identifiers require an archive-state handoff.
 */
export function resolvePicksDestination(
  searchParams: URLSearchParams,
  archivedEventIds: readonly string[],
): PicksDestination {
  const eventId = searchParams.get("event")?.trim() ?? "";
  if (!eventId || !archivedEventIds.includes(eventId)) return { kind: "none" };

  return {
    kind: "archived-event",
    eventId,
    recapRequested: searchParams.get("view") === "recap",
  };
}
