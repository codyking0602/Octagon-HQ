import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { ChallengeJson } from "../challenges/challengeModel";
import { FOOTBALL_GM_ROSTER_SLOTS, type FootballGmRosterSlot } from "../back-room/footballGmEngine";

const phaseSchema = z.enum(["waiting", "draft", "year1", "offseason", "complete"]);

const participantSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1),
  seat_order: z.coerce.number().int().min(0).max(1),
  accepted: z.boolean(),
  run_state: z.record(z.string(), z.unknown()).default({}),
  year1_result: z.record(z.string(), z.unknown()).nullable().default(null),
  year1_acknowledged: z.boolean().default(false),
  offseason_complete: z.boolean(),
});

const stateSchema = z.object({
  code: z.string().min(4),
  seed: z.string().min(8),
  phase: phaseSchema,
  turn_count: z.coerce.number().int().min(0).max(14),
  current_turn_profile_id: z.string().uuid().nullable(),
  pending_team_code: z.string().nullable(),
  offseason_first_profile_id: z.string().uuid().nullable(),
  participants: z.array(participantSchema).length(2),
  opened_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  declined_at: z.string().nullable(),
  forfeited_by_profile_id: z.string().uuid().nullable().default(null),
  forfeited_at: z.string().nullable().default(null),
});

export type FootballGmMatchState = z.infer<typeof stateSchema>;
export type FootballGmMatchParticipant = z.infer<typeof participantSchema>;

type RpcError = { message?: string };
type Client = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: RpcError | null }>;
};

async function rpc(client: Client, name: string, args?: Record<string, unknown>) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message || "The GM match could not be synced.");
  return data;
}

function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

export interface FootballGmMatchRepository {
  create(recipientId: string): Promise<string>;
  cancel(code: string): Promise<boolean>;
  forfeit(code: string): Promise<FootballGmMatchState>;
  load(code: string): Promise<FootballGmMatchState>;
  open(code: string): Promise<FootballGmMatchState>;
  spin(code: string, eligibleTeamCodes: readonly string[]): Promise<FootballGmMatchState>;
  pick(
    code: string,
    input: {
      playerId: string;
      slot: FootballGmRosterSlot;
      runState: unknown;
    },
  ): Promise<FootballGmMatchState>;
  submitYear1(code: string, result: unknown): Promise<FootballGmMatchState>;
  acknowledgeYear1(code: string): Promise<FootballGmMatchState>;
  saveOffseason(code: string, runState: unknown): Promise<FootballGmMatchState>;
  finishOffseason(code: string, runState: unknown): Promise<FootballGmMatchState>;
}

export function createFootballGmMatchRepository(
  suppliedClient?: Client | null,
): FootballGmMatchRepository | null {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as Client | null
    : suppliedClient;
  if (!client) return null;

  return {
    async create(recipientId) {
      return z.string().min(4).parse(await rpc(client, "create_football_gm_challenge", {
        p_recipient_id: recipientId,
      }));
    },
    async cancel(code) {
      return z.boolean().parse(await rpc(client, "cancel_football_gm_challenge", { p_code: code }));
    },
    async forfeit(code) {
      return stateSchema.parse(await rpc(client, "forfeit_football_gm", { p_code: code }));
    },
    async load(code) {
      return stateSchema.parse(await rpc(client, "get_my_football_gm_match", { p_code: code }));
    },
    async open(code) {
      return stateSchema.parse(await rpc(client, "open_football_gm_challenge", { p_code: code }));
    },
    async spin(code, eligibleTeamCodes) {
      return stateSchema.parse(await rpc(client, "spin_football_gm", {
        p_code: code,
        p_eligible_team_codes: [...eligibleTeamCodes],
      }));
    },
    async pick(code, input) {
      if (!FOOTBALL_GM_ROSTER_SLOTS.includes(input.slot)) {
        throw new Error("That GM roster slot is unavailable.");
      }
      return stateSchema.parse(await rpc(client, "pick_football_gm", {
        p_code: code,
        p_player_id: input.playerId,
        p_slot: input.slot,
        p_run_state: asJson(input.runState),
      }));
    },
    async submitYear1(code, result) {
      return stateSchema.parse(await rpc(client, "submit_football_gm_year1", {
        p_code: code,
        p_result: asJson(result),
      }));
    },
    async acknowledgeYear1(code) {
      return stateSchema.parse(await rpc(client, "acknowledge_football_gm_year1", {
        p_code: code,
      }));
    },
    async saveOffseason(code, runState) {
      return stateSchema.parse(await rpc(client, "save_football_gm_offseason", {
        p_code: code,
        p_run_state: asJson(runState),
      }));
    },
    async finishOffseason(code, runState) {
      return stateSchema.parse(await rpc(client, "finish_football_gm_offseason", {
        p_code: code,
        p_run_state: asJson(runState),
      }));
    },
  };
}
