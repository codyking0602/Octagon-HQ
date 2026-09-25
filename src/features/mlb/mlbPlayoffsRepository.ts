import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { MlbPlayoffRound } from "./mlbPlayoffsConfig";

const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  seed: z.number().int().nullable().optional().default(null),
  league: z.enum(["AL", "NL"]).nullable().optional().default(null),
  logo_url: z.string().nullable().optional().default(null),
});

const slotSchema = z.object({
  team_id: z.string().nullable().optional().default(null),
  source_node_id: z.string().nullable().optional().default(null),
});

const nodeSchema = z.object({
  id: z.string(),
  round: z.enum(["wild_card", "division_series", "championship_series", "world_series"]),
  league: z.enum(["AL", "NL"]).nullable().optional().default(null),
  label: z.string(),
  points: z.number().int().positive(),
  left: slotSchema,
  right: slotSchema,
});

const bracketTemplateSchema = z.object({
  teams: z.array(teamSchema).default([]),
  nodes: z.array(nodeSchema).default([]),
});

const seriesSchema = z.object({
  series_id: z.string(),
  round: z.enum(["wild_card", "division_series", "championship_series", "world_series"]),
  league: z.enum(["AL", "NL"]).nullable(),
  label: z.string(),
  team_a_id: z.string(),
  team_a_name: z.string(),
  team_b_id: z.string(),
  team_b_name: z.string(),
  starts_at: z.string().nullable(),
  status: z.string(),
  winner_team_id: z.string().nullable(),
  series_score: z.string().nullable(),
  schedule: z.array(z.string()).default([]),
});

const bracketEntrySchema = z.object({
  profile_id: z.string(),
  display_name: z.string(),
  picks: z.record(z.string(), z.string()),
  score: z.number().int(),
  is_current_user: z.boolean(),
});

const roundPickSchema = z.object({
  series_id: z.string(),
  winner_team_id: z.string(),
  picked_at: z.string(),
});

const spotlightSchema = z.object({
  series_id: z.string().nullable().optional().default(null),
  title: z.string(),
  round: z.string(),
  status: z.string(),
  overview: z.string(),
  keys: z.array(z.string()),
  player_to_watch: z.string(),
  player_context: z.string(),
  stats: z.array(z.string()),
}).nullable();

const challengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  kicker: z.string(),
  description: z.string(),
  route: z.string(),
}).nullable();

const hubSchema = z.object({
  season: z.number().int(),
  public_enabled: z.boolean(),
  field_ready: z.boolean(),
  current_round: z.enum(["wild_card", "division_series", "championship_series", "world_series"]),
  bracket_lock_at: z.string().nullable(),
  bracket_locked: z.boolean(),
  bracket_template: bracketTemplateSchema,
  own_bracket: z.record(z.string(), z.string()).nullable(),
  own_bracket_score: z.number().int(),
  brackets: z.array(bracketEntrySchema),
  series: z.array(seriesSchema),
  own_round_picks: z.array(roundPickSchema),
  spotlight: spotlightSchema,
  featured_challenge: challengeSchema,
});

export type MlbTeam = z.infer<typeof teamSchema>;
export type MlbBracketSlot = {
  teamId: string | null;
  sourceNodeId: string | null;
};
export type MlbBracketNode = {
  id: string;
  round: MlbPlayoffRound;
  league: "AL" | "NL" | null;
  label: string;
  points: number;
  left: MlbBracketSlot;
  right: MlbBracketSlot;
};
export type MlbBracketTemplate = {
  teams: MlbTeam[];
  nodes: MlbBracketNode[];
};
export type MlbPlayoffSeries = z.infer<typeof seriesSchema>;
export type MlbBracketEntry = z.infer<typeof bracketEntrySchema>;
export type MlbPlayoffsHub = {
  season: number;
  publicEnabled: boolean;
  fieldReady: boolean;
  currentRound: MlbPlayoffRound;
  bracketLockAt: string | null;
  bracketLocked: boolean;
  bracketTemplate: MlbBracketTemplate;
  ownBracket: Record<string, string> | null;
  ownBracketScore: number;
  brackets: MlbBracketEntry[];
  series: MlbPlayoffSeries[];
  ownRoundPicks: z.infer<typeof roundPickSchema>[];
  spotlight: z.infer<typeof spotlightSchema>;
  featuredChallenge: z.infer<typeof challengeSchema>;
};

async function rpc(name: string, params: Record<string, unknown>) {
  const client = getSupabaseClient();
  if (!client) throw new Error("MLB Playoffs is not connected on this build.");
  const { data, error } = await client.rpc(name, params);
  if (error) throw new Error(error.message || "MLB Playoffs could not load.");
  return data;
}

function mapTemplate(value: z.infer<typeof bracketTemplateSchema>): MlbBracketTemplate {
  return {
    teams: value.teams,
    nodes: value.nodes.map((node) => ({
      id: node.id,
      round: node.round,
      league: node.league,
      label: node.label,
      points: node.points,
      left: { teamId: node.left.team_id, sourceNodeId: node.left.source_node_id },
      right: { teamId: node.right.team_id, sourceNodeId: node.right.source_node_id },
    })),
  };
}

function mapHub(value: unknown): MlbPlayoffsHub {
  const parsed = hubSchema.parse(value);
  return {
    season: parsed.season,
    publicEnabled: parsed.public_enabled,
    fieldReady: parsed.field_ready,
    currentRound: parsed.current_round,
    bracketLockAt: parsed.bracket_lock_at,
    bracketLocked: parsed.bracket_locked,
    bracketTemplate: mapTemplate(parsed.bracket_template),
    ownBracket: parsed.own_bracket,
    ownBracketScore: parsed.own_bracket_score,
    brackets: parsed.brackets,
    series: parsed.series,
    ownRoundPicks: parsed.own_round_picks,
    spotlight: parsed.spotlight,
    featuredChallenge: parsed.featured_challenge,
  };
}

export async function loadMlbPlayoffsHub(season: number) {
  return mapHub(await rpc("get_mlb_playoffs_hub", { p_season: season }));
}

export async function saveMlbPlayoffBracket(season: number, picks: Record<string, string>) {
  return mapHub(await rpc("save_mlb_playoff_bracket", { p_season: season, p_picks: picks }));
}

export async function saveMlbSeriesPick(seriesId: string, winnerTeamId: string) {
  return mapHub(await rpc("save_mlb_series_pick", {
    p_series_id: seriesId,
    p_winner_team_id: winnerTeamId,
  }));
}
