export type PicksDestination =
  | { kind: "none" }
  | { kind: "archived-event"; eventId: string; recapRequested: boolean };

/**
 * Lets the existing Picks archive owner consume canonical event links.
 * A recap request without an event is a compatibility handoff for older
 * notifications and resolves only to the newest archived event.
 */
export function resolvePicksDestination(
  searchParams: URLSearchParams,
  archivedEventIds: readonly string[],
): PicksDestination {
  const requestedEventId = searchParams.get("event")?.trim() ?? "";
  const recapRequested = searchParams.get("view") === "recap";
  const eventId = requestedEventId || (recapRequested ? archivedEventIds[0] ?? "" : "");

  if (!eventId || !archivedEventIds.includes(eventId)) return { kind: "none" };

  return {
    kind: "archived-event",
    eventId,
    recapRequested,
  };
}
