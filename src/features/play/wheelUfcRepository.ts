import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import { WHEEL_UFC_ROSTER_SLOTS } from "../back-room/wheelUfcModel";

const rosterSlotSchema = z.enum(WHEEL_UFC_ROSTER_SLOTS);
const categorySchema = z.enum([
  "CHAMPION",
  "TOP_5",
  "SIX_TO_FIFTEEN",
  "UNRANKED",
  "COUNTRY",
  "YOUNG_GUN",
  "VETERAN",
] as const);

const participantSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1),
});

const pickSchema = z.object({
  turn_number: z.coerce.number().int().min(1).max(16),
  fighter_id: z.string().min(1),
  display_name: z.string().min(1),
  roster_slot: rosterSlotSchema,
  ranking_label: z.string().min(1),
  country_code: z.string().nullable(),
  country_name: z.string().nullable(),
  headshot_url: z.string().nullable(),
  revealed_grade: z.coerce.number().min(0).max(100).nullable().optional().default(null),
});

const pendingSpinSchema = z.object({
  category: categorySchema,
  label: z.string().min(1),
  country_code: z.string().nullable(),
  country_name: z.string().nullable(),
  eligible_slots: z.array(rosterSlotSchema),
});

const resultSchema = z.object({
  creator_final_grade: z.coerce.number().min(0).max(100),
  recipient_final_grade: z.coerce.number().min(0).max(100),
  winner_profile_id: z.string().uuid().nullable(),
  is_tie: z.boolean(),
});

const stateSchema = z.object({
  code: z.string().min(4),
  phase: z.enum(["waiting", "spin", "pick", "complete"]),
  turn_count: z.coerce.number().int().min(0).max(16),
  current_turn_profile_id: z.string().uuid().nullable(),
  pending_spin: pendingSpinSchema.nullable(),
  creator: participantSchema,
  recipient: participantSchema,
  creator_roster: z.array(pickSchema),
  recipient_roster: z.array(pickSchema),
  result: resultSchema.nullable(),
  opened_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  forfeited_by_profile_id: z.string().uuid().nullable(),
  forfeited_at: z.string().nullable(),
});

const candidateSchema = z.object({
  fighter_id: z.string().min(1),
  display_name: z.string().min(1),
  division: rosterSlotSchema,
  ranking_label: z.string().min(1),
  country_code: z.string().nullable(),
  country_name: z.string().nullable(),
  headshot_url: z.string().nullable(),
});

export type WheelUfcState = z.infer<typeof stateSchema>;
export type WheelUfcPick = z.infer<typeof pickSchema>;
export type WheelUfcCandidate = z.infer<typeof candidateSchema>;

type RpcError = { message?: string };
type Client = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: RpcError | null }>;
};

async function rpc(client: Client, name: string, args?: Record<string, unknown>) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message || "Wheel of UFC could not be synced.");
  return data;
}

export interface WheelUfcRepository {
  create(recipientId: string): Promise<string>;
  load(code: string): Promise<WheelUfcState>;
  open(code: string): Promise<boolean>;
  spin(code: string): Promise<WheelUfcState>;
  candidates(code: string, rosterSlot: (typeof WHEEL_UFC_ROSTER_SLOTS)[number]): Promise<WheelUfcCandidate[]>;
  pick(code: string, fighterId: string, rosterSlot: (typeof WHEEL_UFC_ROSTER_SLOTS)[number]): Promise<WheelUfcState>;
  forfeit(code: string): Promise<WheelUfcState>;
}

export function createWheelUfcRepository(
  suppliedClient?: Client | null,
): WheelUfcRepository | null {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as Client | null
    : suppliedClient;
  if (!client) return null;

  return {
    async create(recipientId) {
      return z.string().min(4).parse(await rpc(client, "create_wheel_ufc_challenge", {
        p_recipient_id: recipientId,
      }));
    },
    async load(code) {
      return stateSchema.parse(await rpc(client, "get_my_wheel_ufc_match", { p_code: code }));
    },
    async open(code) {
      return z.boolean().parse(await rpc(client, "open_wheel_ufc_challenge", { p_code: code }));
    },
    async spin(code) {
      return stateSchema.parse(await rpc(client, "spin_wheel_ufc", { p_code: code }));
    },
    async candidates(code, rosterSlot) {
      return z.array(candidateSchema).parse(await rpc(client, "get_wheel_ufc_candidates", {
        p_code: code,
        p_roster_slot: rosterSlot,
      }));
    },
    async pick(code, fighterId, rosterSlot) {
      return stateSchema.parse(await rpc(client, "pick_wheel_ufc", {
        p_code: code,
        p_fighter_id: fighterId,
        p_roster_slot: rosterSlot,
      }));
    },
    async forfeit(code) {
      return stateSchema.parse(await rpc(client, "forfeit_wheel_ufc", { p_code: code }));
    },
  };
}
