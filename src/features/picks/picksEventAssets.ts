import { getSupabaseClient } from "../../lib/supabase";
import type { PickEvent, PickHistoryEvent } from "./picksModel";
import { reviewedMmaManiaPoster, reviewedOfficialUfcEventBanner } from "./ufcMmaManiaPoster";

export const PICK_EVENT_HEADER_BUCKET = "pick-event-headers";
export const PICK_EVENT_HEADER_MAX_IMAGES = 4;

export interface PickEventPoster {
  src: string;
  aspectRatio: string;
}

function pickEventHeaderPaths(event: PickEvent | PickHistoryEvent | null) {
  if (!event?.headerStoragePath) return [];

  const galleryMatch = event.headerStoragePath.match(/^(.*\/event-header-gallery-)([2-4])-1$/);
  if (!galleryMatch) return [event.headerStoragePath];

  const count = Number(galleryMatch[2]);
  return Array.from({ length: count }, (_, index) => `${galleryMatch[1]}${count}-${index + 1}`);
}

export function pickEventPosters(event: PickEvent | PickHistoryEvent | null): PickEventPoster[] {
  if (
    !event?.headerStoragePath
    || !event.headerNaturalWidth
    || !event.headerNaturalHeight
  ) {
    return [];
  }

  const client = getSupabaseClient();
  if (!client) return [];

  const bucket = client.storage.from(PICK_EVENT_HEADER_BUCKET);
  const aspectRatio = `${event.headerNaturalWidth} / ${event.headerNaturalHeight}`;

  return pickEventHeaderPaths(event).map((path) => ({
    src: bucket.getPublicUrl(path).data.publicUrl,
    aspectRatio,
  }));
}

export function pickEventPoster(event: PickEvent | PickHistoryEvent | null): PickEventPoster | null {
  return pickEventPosters(event)[0] ?? null;
}

/** Replay the exact vetted fight-week artwork for a completed UFC event.
 * The weekly publisher ledger expires for LIVE display, not for event history.
 * Event identity is checked by the existing publisher validator; absent a
 * verified record, retain the same official/banner and persisted-header fallbacks
 * as the live Picks page. No opponent-based image guessing is introduced.
 */
export function pickArchivedEventPoster(event: PickHistoryEvent): PickEventPoster | null {
  return reviewedMmaManiaPoster(event, new Date(event.startsAt))
    ?? reviewedOfficialUfcEventBanner(event)
    ?? pickEventPoster(event);
}
