import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { PlayGameId } from "../play/playRegistry";
import type { ChallengeJson, ChallengeProfile, PlayChallenge } from "./challengeModel";

const challengeRowSchema = z.object({
  code: z.string().min(4),
  game_id: z.string().min(1),
  game_version: z.string().min(1),
  game_title: z.string().min(1),
  summary: z.string().min(1),
  creator_id: z.string().uuid(),
  recipient_id: z.string().uuid(),
  play_url: z.string(),
  setup: z.unknown(),
  creator_result: z.unknown().nullable(),
  responder_result: z.unknown().nullable(),
  created_at: z.string(),
  opened_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  declined_at: z.string().nullable(),
  expires_at: z.string(),
});

const profileRowSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1),
  initials: z.string().min(1).max(2),
});

export interface RemoteChallengeDraft {
  gameId: PlayGameId;
  gameVersion: string;
  gameTitle: string;
  summary: string;
  recipientId: string;
  playUrl: string;
  setup: ChallengeJson;
  creatorResult: ChallengeJson;
}

export interface ChallengeSnapshot {
  challenges: PlayChallenge[];
  profiles: ChallengeProfile[];
}

export interface ChallengeRepository {
  load: () => Promise<ChallengeSnapshot>;
  findProfile: (displayName: string, activeProfileId: string) => Promise<ChallengeProfile | null>;
  create: (draft: RemoteChallengeDraft) => Promise<string>;
  markOpened: (code: string) => Promise<void>;
  submitResult: (code: string, result: ChallengeJson) => Promise<void>;
  dismiss: (code: string) => Promise<void>;
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not update that challenge.";
}

function toProfile(value: unknown): ChallengeProfile {
  const row = profileRowSchema.parse(value);
  return {
    id: row.id,
    displayName: row.display_name,
    initials: row.initials,
  };
}

function toChallenge(value: unknown): PlayChallenge {
  const row = challengeRowSchema.parse(value);
  return {
    code: row.code,
    gameId: row.game_id as PlayGameId,
    gameVersion: row.game_version,
    gameTitle: row.game_title,
    summary: row.summary,
    creatorId: row.creator_id,
    recipientId: row.recipient_id,
    playUrl: row.play_url,
    setup: row.setup as ChallengeJson,
    creatorResult: row.creator_result as ChallengeJson,
    responderResult: row.responder_result as ChallengeJson,
    createdAt: row.created_at,
    openedAt: row.opened_at,
    completedAt: row.completed_at,
    declinedAt: row.declined_at,
    expiresAt: row.expires_at,
    hiddenFor: [],
  };
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Octagon HQ could not update that challenge.");
  return data;
}

export function createChallengeRepository(): ChallengeRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async load() {
      const rawRows = await requireRpcSuccess(client.rpc("list_my_play_challenges"));
      const challenges = z.array(challengeRowSchema).parse(rawRows ?? []).map(toChallenge);
      const profileIds = [...new Set(challenges.flatMap((row) => [row.creatorId, row.recipientId]))];

      if (!profileIds.length) return { challenges, profiles: [] };

      const { data, error } = await client
        .from("profiles")
        .select("id, display_name, initials")
        .in("id", profileIds);
      if (error) throw new Error(error.message);

      return {
        challenges,
        profiles: z.array(profileRowSchema).parse(data ?? []).map(toProfile),
      };
    },

    async findProfile(displayName, activeProfileId) {
      const normalizedName = normalizeName(displayName);
      if (normalizedName.length < 2) return null;

      const { data, error } = await client
        .from("profiles")
        .select("id, display_name, initials")
        .eq("normalized_name", normalizedName)
        .neq("id", activeProfileId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toProfile(data) : null;
    },

    async create(draft) {
      const data = await requireRpcSuccess(client.rpc("create_play_challenge", {
        p_recipient_id: draft.recipientId,
        p_game_id: draft.gameId,
        p_game_version: draft.gameVersion,
        p_game_title: draft.gameTitle,
        p_summary: draft.summary,
        p_play_url: draft.playUrl,
        p_setup: draft.setup,
        p_creator_result: draft.creatorResult,
      }));
      if (typeof data !== "string" || !data) throw new Error("The challenge was not created.");
      return data;
    },

    async markOpened(code) {
      const updated = await requireRpcSuccess(client.rpc("open_play_challenge", { p_code: code }));
      if (!updated) throw new Error("That challenge could not be opened.");
    },

    async submitResult(code, result) {
      const updated = await requireRpcSuccess(client.rpc("complete_play_challenge", {
        p_code: code,
        p_result: result,
      }));
      if (!updated) throw new Error("That challenge could not be completed.");
    },

    async dismiss(code) {
      const updated = await requireRpcSuccess(client.rpc("dismiss_play_challenge", { p_code: code }));
      if (!updated) throw new Error("That challenge could not be removed.");
    },
  };
}

export function challengeRepositoryError(error: unknown) {
  return readableError(error);
}
