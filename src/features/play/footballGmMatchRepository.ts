import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { ChallengeJson } from "../challenges/challengeModel";
import { FOOTBALL_GM_ROSTER_SLOTS, type FootballGmRosterEntry, type FootballGmRosterSlot } from "../back-room/footballGmEngine";
import { FOOTBALL_GM_VERSION, footballGmSeasonResultV2, type FootballGmSeasonResultV2 } from "../back-room/footballGmStrategy";
import { footballGmRepairLegacyYearOne, footballGmSharedThreeYears } from "../back-room/footballGmSharedPostseason";

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
  forfeited_by_profile_id: z.string().uuid().nullable().optional().default(null),
  forfeited_at: z.string().nullable().optional().default(null),
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

function resolvableRunState(value: unknown) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.seed !== "string" || !Array.isArray(row.roster) || !Array.isArray(row.finalRoster)) return null;
  return row as Record<string, unknown> & {
    seed: string;
    roster: FootballGmRosterEntry[];
    finalRoster: FootballGmRosterEntry[];
  };
}

function storedYearOneResult(value: unknown): FootballGmSeasonResultV2 | null {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    row.year !== 1
    || typeof row.rawTeamGrade !== "number"
    || typeof row.weakLinkPenalty !== "number"
    || typeof row.continuityAdjustment !== "number"
    || typeof row.teamGrade !== "number"
    || typeof row.finish !== "string"
    || typeof row.postseasonBonus !== "number"
    || typeof row.titleOdds !== "number"
  ) return null;
  return row as unknown as FootballGmSeasonResultV2;
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
      const resolved = resolvableRunState(runState);
      let lockedRunState = runState;
      if (resolved && resolved.roster.length === 7 && resolved.finalRoster.length === 7) {
        const beforeFinish = stateSchema.parse(await rpc(client, "get_my_football_gm_match", { p_code: code }));
        const activeParticipant = beforeFinish.participants.find(
          (participant) => participant.id === beforeFinish.current_turn_profile_id,
        );
        const yearOne = storedYearOneResult(activeParticipant?.year1_result)
          ?? footballGmSeasonResultV2({
            seed: resolved.seed,
            yearOneRoster: resolved.roster,
            roster: resolved.roster,
            year: 1,
          });
        const other = beforeFinish.participants.find((participant) => participant.id !== activeParticipant?.id);
        const otherRun = resolvableRunState(other?.run_state);
        if (activeParticipant && other && other.offseason_complete && otherRun && otherRun.finalRoster.length === 7) {
          // The second offseason close atomically locks BOTH franchises' results.
          const shared = footballGmSharedThreeYears(beforeFinish.seed, [
            { key: activeParticipant.id, yearOneRoster: resolved.roster, finalRoster: resolved.finalRoster },
            { key: other.id, yearOneRoster: otherRun.roster, finalRoster: otherRun.finalRoster },
          ]);
          const oldMine = storedYearOneResult(activeParticipant.year1_result);
          const oldOther = storedYearOneResult(other.year1_result);
          const legacy = oldMine && oldOther
            ? footballGmRepairLegacyYearOne(oldMine, oldOther, beforeFinish.offseason_first_profile_id, activeParticipant.id, other.id)
            : null;
          if (legacy) {
            shared[activeParticipant.id]![0] = legacy[0];
            shared[other.id]![0] = legacy[1];
          } else if (oldMine && oldOther) {
            // Existing legal Year 1 finishes were already locked by the backend.
            // Never rewrite them merely because the new shared model ships later.
            shared[activeParticipant.id]![0] = oldMine;
            shared[other.id]![0] = oldOther;
          }
          lockedRunState = {
            ...resolved,
            version: FOOTBALL_GM_VERSION,
            resolvedSeasons: shared[activeParticipant.id],
            opponentResolvedSeasons: shared[other.id],
          };
        } else {
          // First offseason finisher cannot know the opponent's final roster yet.
          // The server replaces this provisional record when the second GM locks.
          lockedRunState = {
            ...resolved,
            version: FOOTBALL_GM_VERSION,
            resolvedSeasons: [
              yearOne,
              footballGmSeasonResultV2({ seed: resolved.seed, yearOneRoster: resolved.roster, roster: resolved.finalRoster, year: 2 }),
              footballGmSeasonResultV2({ seed: resolved.seed, yearOneRoster: resolved.roster, roster: resolved.finalRoster, year: 3 }),
            ],
          };
        }
      }
      return stateSchema.parse(await rpc(client, "finish_football_gm_offseason", {
        p_code: code,
        p_run_state: asJson(lockedRunState),
      }));
    },
  };
}
