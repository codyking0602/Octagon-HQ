import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { MemberCardSummary, MemberProfileSummary } from "./memberProfilesModel";

const recentActivityRowSchema = z.object({
  kind: z.enum(["find-leader", "picks"]),
  title: z.string().min(1),
  detail: z.string().min(1),
  occurred_at: z.string(),
});

const memberCardRowSchema = z.object({
  display_name: z.string().min(1),
  initials: z.string().min(1).max(2),
  avatar_photo_data: z.string().nullable().optional(),
  favorite_fighter_slug: z.string().nullable(),
  current_streak: z.coerce.number().int().nonnegative(),
  picks_correct: z.coerce.number().int().nonnegative(),
  picks_incorrect: z.coerce.number().int().nonnegative(),
  is_current_user: z.boolean(),
});

const memberProfileRowSchema = memberCardRowSchema.extend({
  best_streak: z.coerce.number().int().nonnegative(),
  perfect_runs: z.coerce.number().int().nonnegative(),
  recorded_days: z.coerce.number().int().nonnegative(),
  best_find_leader_score: z.coerce.number().int().min(0).max(10),
  picks_pending: z.coerce.number().int().nonnegative(),
  picks_events_entered: z.coerce.number().int().nonnegative(),
  recent_activity: z.array(recentActivityRowSchema).optional().default([]),
});

export interface MemberProfilesRepository {
  listMembers: () => Promise<MemberCardSummary[]>;
  loadMember: (displayName: string) => Promise<MemberProfileSummary | null>;
}

function toMemberCard(value: unknown): MemberCardSummary {
  const row = memberCardRowSchema.parse(value);
  return {
    displayName: row.display_name,
    initials: row.initials,
    avatarPhotoData: row.avatar_photo_data ?? null,
    favoriteFighterSlug: row.favorite_fighter_slug,
    currentStreak: row.current_streak,
    picksCorrect: row.picks_correct,
    picksIncorrect: row.picks_incorrect,
    isCurrentUser: row.is_current_user,
  };
}

function toMemberProfile(value: unknown): MemberProfileSummary {
  const row = memberProfileRowSchema.parse(value);
  return {
    ...toMemberCard(row),
    bestStreak: row.best_streak,
    perfectRuns: row.perfect_runs,
    recordedDays: row.recorded_days,
    bestFindLeaderScore: row.best_find_leader_score,
    picksPending: row.picks_pending,
    picksEventsEntered: row.picks_events_entered,
    recentActivity: row.recent_activity.map((activity) => ({
      kind: activity.kind,
      title: activity.title,
      detail: activity.detail,
      occurredAt: activity.occurred_at,
    })),
  };
}

async function requireRpcSuccess<T>(
  request: PromiseLike<{ data: T; error: { message?: string } | null }>,
) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Octagon HQ could not load member profiles.");
  return data;
}

export function createMemberProfilesRepository(): MemberProfilesRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async listMembers() {
      const data = await requireRpcSuccess(client.rpc("list_member_cards"));
      return z.array(memberCardRowSchema).parse(data ?? []).map(toMemberCard);
    },

    async loadMember(displayName) {
      const data = await requireRpcSuccess(client.rpc("get_member_profile", {
        p_member_name: displayName,
      }));
      const raw = Array.isArray(data) ? data[0] : data;
      return raw ? toMemberProfile(raw) : null;
    },
  };
}
