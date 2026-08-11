import { getSupabaseClient } from "../../lib/supabase";
import type { PickEvent, PickHistoryEvent } from "./picksModel";

export const PICK_EVENT_HEADER_BUCKET = "pick-event-headers";

interface PickEventPoster {
  src: string;
  aspectRatio: string;
}

export function pickEventPoster(event: PickEvent | PickHistoryEvent | null): PickEventPoster | null {
  if (
    !event?.headerStoragePath
    || !event.headerNaturalWidth
    || !event.headerNaturalHeight
  ) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) return null;

  const { data } = client.storage
    .from(PICK_EVENT_HEADER_BUCKET)
    .getPublicUrl(event.headerStoragePath);

  return {
    src: data.publicUrl,
    aspectRatio: `${event.headerNaturalWidth} / ${event.headerNaturalHeight}`,
  };
}
