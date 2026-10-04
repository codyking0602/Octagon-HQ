import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

export const WHEEL_UFC_WEIGHT_CLASSES = [
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Light Heavyweight",
  "Heavyweight",
] as const;

export const WHEEL_UFC_CATEGORY_KEYS = [
  "champion",
  "top-5",
  "rank-6-15",
  "unranked",
  "country",
  "young-gun",
  "veteran",
] as const;

export type WheelUfcWeightClass = (typeof WHEEL_UFC_WEIGHT_CLASSES)[number];
export type WheelUfcCategoryKey = (typeof WHEEL_UFC_CATEGORY_KEYS)[number];

const weightClassSchema = z.enum(WHEEL_UFC_WEIGHT_CLASSES);
const categoryKeySchema = z.enum(WHEEL_UFC_CATEGORY_KEYS);

const participantSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1),
});

const pickSchema = z.object({
  turn_number: z.coerce.number().int().min(1).max(16),
  category_key: categoryKeySchema,
  category_country: z.string().nullable(),
  fighter_slug: z.string().min(1),
  display_name: z.string().min(1),
  weight_class: weightClassSchema,
  ranking_position: z.coerce.number().int().min(1).max(15).nullable(),
  was_champion: z.boolean(),
  country: z.string().nullable(),
  headshot_url: z.string().nullable(),
  source_url: z.string().min(1),
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
  pending_category_key: categoryKeySchema.nullable(),
  pending_country: z.string().nullable(),
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

const candidateSchema = z.object({
  fighter_slug: z.string().min(1),
  display_name: z.string().min(1),
  weight_class: weightClassSchema,
  ranking_position: z.coerce.number().int().min(1).max(15).nullable(),
  is_champion: z.boolean(),
  country: z.string().nullable(),
  headshot_url: z.string().nullable(),
  source_url: z.string().min(1),
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
  candidates(code: string): Promise<WheelUfcCandidate[]>;
  pick(code: string, fighterSlug: string): Promise<WheelUfcState>;
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
    async candidates(code) {
      return z.array(candidateSchema).parse(await rpc(client, "list_my_wheel_ufc_candidates", { p_code: code }));
    },
    async pick(code, fighterSlug) {
      return stateSchema.parse(await rpc(client, "pick_wheel_ufc", {
        p_code: code,
        p_fighter_slug: fighterSlug,
      }));
    },
    async forfeit(code) {
      return stateSchema.parse(await rpc(client, "forfeit_wheel_ufc", { p_code: code }));
    },
  };
}
