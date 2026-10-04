import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const memberSchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string().min(1),
  initials: z.string().min(1).max(2),
  seat_order: z.coerce.number().int().min(1).max(8),
  is_current_user: z.boolean(),
});

const standingSchema = z.object({
  rank: z.coerce.number().int().positive(),
  profile_id: z.string().uuid(),
  display_name: z.string().min(1),
  initials: z.string().min(1).max(2),
  seat_order: z.coerce.number().int().min(1).max(8),
  total_score: z.coerce.number().int().min(0).max(400),
  round_scores: z.array(z.coerce.number().int().min(0).max(100)).length(4),
});

const clueSchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string().min(1),
  initials: z.string().min(1).max(2),
  clue: z.string().max(32).nullable(),
  active: z.boolean(),
});

const candidateSchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string().min(1),
  initials: z.string().min(1).max(2),
});

const voteSchema = z.object({
  voter_profile_id: z.string().uuid(),
  voter_display_name: z.string().min(1),
  target_profile_id: z.string().uuid().nullable(),
  target_display_name: z.string().nullable(),
});

const scorecardSchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string().min(1),
  score: z.coerce.number().int().min(0).max(100),
  breakdown: z.record(z.string(), z.unknown()),
  is_impostor: z.boolean(),
});

const resultSchema = z.object({
  outcome: z.enum(["caught", "survived", "forfeit", "no_contest"]),
  caught: z.boolean(),
  guess_correct: z.boolean(),
  max_votes: z.coerce.number().int().nonnegative().optional(),
  secret_answer: z.string().min(1),
  impostor_profile_id: z.string().uuid(),
  impostor_display_name: z.string().min(1),
  impostor_guess: z.string().nullable(),
  votes: z.array(voteSchema),
  scorecards: z.array(scorecardSchema),
});

const roundSchema = z.object({
  round_no: z.coerce.number().int().min(1).max(4),
  is_final_round: z.boolean(),
  phase: z.enum([
    "waiting_round",
    "assignment",
    "clue",
    "clue_locked",
    "board_ready",
    "vote",
    "vote_locked",
    "inactive",
    "resolved",
    "waiting",
  ]),
  round_status: z.enum(["scheduled", "clue", "vote", "resolved", "forfeit", "no_contest"]),
  sport: z.enum(["NFL", "CFB", "UFC"]),
  category: z.string().min(1),
  opens_at: z.string(),
  clue_lock_at: z.string(),
  vote_lock_at: z.string(),
  assignment_revealed: z.boolean(),
  is_impostor: z.boolean().nullable(),
  secret_answer: z.string().nullable(),
  clue_deadline_at: z.string().nullable(),
  my_clue: z.string().nullable(),
  board_opened: z.boolean(),
  vote_deadline_at: z.string().nullable(),
  my_vote_profile_id: z.string().uuid().nullable(),
  votes_locked_count: z.coerce.number().int().nonnegative(),
  active_count: z.coerce.number().int().nonnegative(),
  clues: z.array(clueSchema).nullable(),
  vote_candidates: z.array(candidateSchema).nullable(),
  result: resultSchema.nullable(),
});

const eventSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "completed", "cancelled"]),
  creator_id: z.string().uuid(),
  is_creator: z.boolean(),
  created_at: z.string(),
  completed_at: z.string().nullable(),
  round_count: z.literal(4),
  members: z.array(memberSchema).min(4).max(8),
  standings: z.array(standingSchema).min(4).max(8),
  current_round: roundSchema,
});

export const hqImpostorStateSchema = z.object({
  available: z.literal(true),
  event: eventSchema.nullable(),
});

export type HqImpostorState = z.infer<typeof hqImpostorStateSchema>;
export type HqImpostorEvent = NonNullable<HqImpostorState["event"]>;
export type HqImpostorRound = HqImpostorEvent["current_round"];
export type HqImpostorStanding = HqImpostorEvent["standings"][number];
export type HqImpostorClue = NonNullable<HqImpostorRound["clues"]>[number];

export interface HqImpostorRepository {
  load: () => Promise<HqImpostorState>;
  createEvent: (memberNames: string[]) => Promise<HqImpostorState>;
  revealAssignment: (eventId: string) => Promise<HqImpostorState>;
  submitClue: (eventId: string, clue: string) => Promise<HqImpostorState>;
  openBoard: (eventId: string) => Promise<HqImpostorState>;
  submitVote: (eventId: string, profileId: string, secretGuess?: string | null) => Promise<HqImpostorState>;
}

type RpcResult = PromiseLike<{
  data: unknown;
  error: { message?: string } | null;
}>;

type RpcClient = {
  rpc: (name: string, params?: Record<string, unknown>) => RpcResult;
};

function parseState(value: unknown) {
  return hqImpostorStateSchema.parse(value);
}

async function callStateRpc(client: RpcClient, name: string, params?: Record<string, unknown>) {
  const { data, error } = await client.rpc(name, params);
  if (error) throw new Error(error.message || "HQ Impostor could not complete that request.");
  return parseState(data);
}

export function createHqImpostorRepository(): HqImpostorRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase as unknown as RpcClient;

  return {
    load() {
      return callStateRpc(client, "get_my_hq_impostor");
    },
    createEvent(memberNames) {
      return callStateRpc(client, "create_hq_impostor_event", {
        p_member_names: memberNames,
      });
    },
    revealAssignment(eventId) {
      return callStateRpc(client, "reveal_hq_impostor_assignment", {
        p_event_id: eventId,
      });
    },
    submitClue(eventId, clue) {
      return callStateRpc(client, "submit_hq_impostor_clue", {
        p_event_id: eventId,
        p_clue: clue,
      });
    },
    openBoard(eventId) {
      return callStateRpc(client, "open_hq_impostor_board", {
        p_event_id: eventId,
      });
    },
    submitVote(eventId, profileId, secretGuess = null) {
      return callStateRpc(client, "submit_hq_impostor_vote", {
        p_event_id: eventId,
        p_vote_profile_id: profileId,
        p_secret_guess: secretGuess,
      });
    },
  };
}
