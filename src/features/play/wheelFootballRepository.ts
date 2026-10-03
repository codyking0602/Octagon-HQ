import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import {
  WHEEL_FOOTBALL_ROSTER_SLOTS,
  type WheelFootballDivision,
  type WheelFootballPoolScope,
} from "../back-room/wheelFootballModel";

const rosterSlotSchema = z.enum(WHEEL_FOOTBALL_ROSTER_SLOTS);
const poolScopeSchema = z.enum(["NFL", "AFC", "NFC", "DIVISION"]);

const participantSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1),
});

const teamSchema = z.object({
  code: z.string().min(2).max(3),
  name: z.string().min(1),
  conference: z.enum(["AFC", "NFC"]),
  division: z.enum(["East", "North", "South", "West"]),
});

const pickSchema = z.object({
  turn_number: z.coerce.number().int().min(1).max(14),
  team_code: z.string().min(2).max(3),
  team_name: z.string().min(1),
  roster_slot: rosterSlotSchema,
  athlete_id: z.string().min(1),
  display_name: z.string().min(1),
  position_label: z.string().min(1),
  position_abbreviation: z.string().min(1),
  headshot_url: z.string().nullable(),
});

const resultSchema = z.object({
  creator_final_grade: z.coerce.number().min(0).max(100),
  recipient_final_grade: z.coerce.number().min(0).max(100),
  winner_profile_id: z.string().uuid().nullable(),
  is_tie: z.boolean(),
});

const stateSchema = z.object({
  code: z.string().min(4),
  pool_scope: poolScopeSchema,
  division: z.string().nullable(),
  phase: z.enum(["waiting", "spin", "pick", "complete"]),
  turn_count: z.coerce.number().int().min(0).max(14),
  current_turn_profile_id: z.string().uuid().nullable(),
  pending_team: teamSchema.nullable(),
  creator: participantSchema,
  recipient: participantSchema,
  creator_roster: z.array(pickSchema),
  recipient_roster: z.array(pickSchema),
  result: resultSchema.nullable().optional().default(null),
  opened_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  forfeited_by_profile_id: z.string().uuid().nullable(),
  forfeited_at: z.string().nullable(),
});

export type WheelFootballState = z.infer<typeof stateSchema>;
export type WheelFootballPick = z.infer<typeof pickSchema>;

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
    recipientId: string,
    scope: WheelFootballPoolScope,
    division: WheelFootballDivision | null,
  ): Promise<string>;
  load(code: string): Promise<WheelFootballState>;
  open(code: string): Promise<boolean>;
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
    async create(recipientId, scope, division) {
      const data = await rpc(client, "create_wheel_football_challenge", {
        p_recipient_id: recipientId,
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
