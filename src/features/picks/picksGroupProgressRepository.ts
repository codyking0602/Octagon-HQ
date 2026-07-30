import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { PickEventMemberProgress } from "./groupProgressModel";

const progressRowSchema = z.object({
  profile_id: z.string(),
  display_name: z.string(),
  completed: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  has_underdog_lock: z.boolean(),
  is_current_user: z.boolean(),
});

export async function loadPickGroupProgress(eventId: string): Promise<PickEventMemberProgress[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_event_pick_progress", {
    p_event_id: eventId,
  });
  if (error) throw new Error(error.message || "Group Picks progress is unavailable.");

  return z.array(progressRowSchema).parse(data ?? []).map((row) => ({
    profileId: row.profile_id,
    displayName: row.display_name,
    completed: row.completed,
    total: row.total,
    hasUnderdogLock: row.has_underdog_lock,
    isCurrentUser: row.is_current_user,
  }));
}
