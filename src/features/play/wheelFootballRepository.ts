import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import {
  WHEEL_FOOTBALL_ROSTER_SLOTS,
  type WheelFootballDivision,
  type WheelFootballPoolScope,
} from "../back-room/wheelFootballModel";

const rosterSlotSchema = z.enum(WHEEL_FOOTBALL_ROSTER_SLOTS);
const poolScopeSchema = z.enum([
  "NFL",
  "AFC",
  "NFC",
  "DIVISION",
  "CFB",
  "AP_TOP_25",
  "SEC",
  "BIG_TEN",
  "BIG_12",
  "ACC",
]);

const participantIdentitySchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1),
});

const teamSchema = z.object({
  code: z.string().min(1).max(64),
  name: z.string().min(1),
  conference: z.enum(["AFC", "NFC", "SEC", "Big Ten", "Big 12", "ACC", "Independent", "Pac-12"]),
  division: z.enum(["East", "North", "South", "West"]).nullable(),
});

const pickSchema = z.object({
  turn_number: z.coerce.number().int().min(1).max(28),
  team_code: z.string().min(1).max(64),
  team_name: z.string().min(1),
  roster_slot: rosterSlotSchema,
  athlete_id: z.string().min(1),
  display_name: z.string().min(1),
  position_label: z.string().min(1),
  position_abbreviation: z.string().min(1),
  headshot_url: z.string().nullable(),
});

const participantSchema = participantIdentitySchema.extend({
  seat_order: z.coerce.number().int().min(0).max(3),
  accepted: z.boolean(),
  forfeited_at: z.string().nullable(),
  roster: z.array(pickSchema),
  final_grade: z.coerce.number().min(0).max(100).nullable(),
  rank: z.coerce.number().int().min(1).max(4).nullable(),
});

const standingSchema = z.object({
  profile_id: z.string().uuid(),
  final_grade: z.coerce.number().min(0).max(100).nullable(),
  rank: z.coerce.number().int().min(1).max(4).nullable(),
  forfeited: z.boolean(),
});

const resultSchema = z.object({
  standings: z.array(standingSchema).min(2).max(4),
  winner_profile_ids: z.array(z.string().uuid()).max(4),
  is_tie: z.boolean(),
  resolved_by_forfeit: z.boolean(),
  creator_final_grade: z.coerce.number().min(0).max(100).nullable().optional().default(null),
  recipient_final_grade: z.coerce.number().min(0).max(100).nullable().optional().default(null),
  winner_profile_id: z.string().uuid().nullable().optional().default(null),
});

const stateSchema = z.object({
  code: z.string().min(4),
  pool_scope: poolScopeSchema,
  division: z.string().nullable(),
  phase: z.enum(["waiting", "spin", "pick", "complete"]),
  turn_count: z.coerce.number().int().min(0).max(28),
  max_turns: z.coerce.number().int().min(0).max(28),
  current_turn_profile_id: z.string().uuid().nullable(),
  pending_team: teamSchema.nullable(),
  eligible_team_codes: z.array(z.string().min(1).max(64)).nullable().optional().default(null),
  participants: z.array(participantSchema).min(2).max(4),
  creator: participantIdentitySchema,
  recipient: participantIdentitySchema,
  creator_roster: z.array(pickSchema),
  recipient_roster: z.array(pickSchema),
  result: resultSchema.nullable().optional().default(null),
  opened_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  declined_at: z.string().nullable().optional().default(null),
});

export type WheelFootballState = z.infer<typeof stateSchema>;
export type WheelFootballPick = z.infer<typeof pickSchema>;
export type WheelFootballParticipant = z.infer<typeof participantSchema>;
export type WheelFootballStanding = z.infer<typeof standingSchema>;

type RpcError = { message?: string };
type Client = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: RpcError | null }>;
};

async function rpc(client: Client, name: string, args?: Record<string, unknown>) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message || "Wheel of Football could not be synced.");
  return data;
}

export interface WheelFootballRepository {
  create(
    recipientIds: readonly string[],
    scope: WheelFootballPoolScope,
    division: WheelFootballDivision | null,
  ): Promise<string>;
  load(code: string): Promise<WheelFootballState>;
  open(code: string): Promise<boolean>;
  decline(code: string): Promise<boolean>;
  spin(code: string): Promise<WheelFootballState>;
  forfeit(code: string): Promise<WheelFootballState>;
  pick(
    code: string,
    input: {
      athleteId: string;
      displayName: string;
      positionLabel: string;
      positionAbbreviation: string;
      rosterSlot: (typeof WHEEL_FOOTBALL_ROSTER_SLOTS)[number];
      headshotUrl: string | null;
    },
  ): Promise<WheelFootballState>;
}

export function createWheelFootballRepository(
  suppliedClient?: Client | null,
): WheelFootballRepository | null {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as Client | null
    : suppliedClient;
  if (!client) return null;

  return {
    async create(recipientIds, scope, division) {
      const ids = [...new Set(recipientIds)];
      if (ids.length < 1 || ids.length > 3) {
        throw new Error("Choose between one and three opponents.");
      }
      const data = await rpc(client, "create_wheel_football_challenge", {
        p_recipient_ids: ids,
        p_pool_scope: scope,
        p_division: division,
      });
      return z.string().min(4).parse(data);
    },
    async load(code) {
      return stateSchema.parse(await rpc(client, "get_my_wheel_football_match", { p_code: code }));
    },
    async open(code) {
      return z.boolean().parse(await rpc(client, "open_wheel_football_challenge", { p_code: code }));
    },
    async decline(code) {
      return z.boolean().parse(await rpc(client, "decline_wheel_football_challenge", { p_code: code }));
    },
    async spin(code) {
      return stateSchema.parse(await rpc(client, "spin_wheel_football", { p_code: code }));
    },
    async forfeit(code) {
      return stateSchema.parse(await rpc(client, "forfeit_wheel_football", { p_code: code }));
    },
    async pick(code, input) {
      return stateSchema.parse(await rpc(client, "pick_wheel_football", {
        p_code: code,
        p_athlete_id: input.athleteId,
        p_display_name: input.displayName,
        p_position_label: input.positionLabel,
        p_position_abbreviation: input.positionAbbreviation,
        p_roster_slot: input.rosterSlot,
        p_headshot_url: input.headshotUrl,
      }));
    },
  };
}
