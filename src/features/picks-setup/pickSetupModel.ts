import type { PickSpotlight } from "../picks/spotlightModel";

export type PickSetupCardScope = "auto" | "main" | "full";
export type PickSetupEffectiveScope = "main" | "full";
export type PickSetupBoutSection = "main-event" | "main" | "prelim" | "early-prelim";
export type PickSetupSport = "mma" | "football";
export type PickSetupFootballLeague = "nfl" | "college-football";
export type PickSetupSpotlight = PickSpotlight;

export interface PickSetupBout {
  boutId: string;
  position: number;
  weightClass: string;
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  included: boolean;
  kickoffAt?: string | null;
  homeTeamSlug?: string | null;
  awayTeamSlug?: string | null;
  spreadHome?: number | null;
  spreadSource?: string | null;
  spreadUpdatedAt?: string | null;
}

export interface PickSetupDraft {
  draftId: string;
  source: string;
  sourceEventKey: string;
  sourceUrl: string | null;
  eventId: string;
  sport?: PickSetupSport;
  league?: string | null;
  eventKind?: string;
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  startsAt: string | null;
  locksAt: string | null;
  season: number;
  state: "staged" | "published";
  syncedAt: string;
  updatedAt: string;
  warnings: string[];
  canPublish: boolean;
  spotlights?: PickSetupSpotlight[];
  bouts: PickSetupBout[];
}

export interface PickSetupFootballWeekGame {
  espnEventId: string;
  league: PickSetupFootballLeague;
  name: string;
  kickoffAt: string;
  homeTeamName: string;
  awayTeamName: string;
  homeRank: number | null;
  awayRank: number | null;
  candidateRank?: number;
}

export interface PickSetupFootballWeekPreview {
  weekStart: string;
  weekEnd: string;
  recommendedCollegeCount: number;
  nflGames: PickSetupFootballWeekGame[];
  collegeCandidates: PickSetupFootballWeekGame[];
  collegeGames: PickSetupFootballWeekGame[];
}

export interface PickSetupSourceEventPreview {
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  startsAt: string;
  locksAt: string;
  bouts: PickSetupBout[];
}

export interface PickSetupSourcePreview {
  sourceHash: string;
  requestedScope: PickSetupCardScope;
  effectiveScope: PickSetupEffectiveScope;
  source: string;
  sourceUrl: string;
  fightCount: number;
  changes: string[];
  warnings: string[];
  event: PickSetupSourceEventPreview;
}

export interface PickSetupMetadataPatch {
  event_id?: string;
  name?: string;
  subtitle?: string;
  venue?: string;
  location?: string;
  starts_at?: string;
  locks_at?: string;
  season?: number;
}

export interface PickSetupBoutInput {
  bout_id?: string;
  position: number;
  weight_class: string;
  red_fighter_slug?: string;
  red_fighter_name: string;
  blue_fighter_slug?: string;
  blue_fighter_name: string;
  included: boolean;
}

export function pickSetupBoutSection(boutId: string): PickSetupBoutSection {
  if (boutId.startsWith("main-event-")) return "main-event";
  if (boutId.startsWith("early-prelim-")) return "early-prelim";
  if (boutId.startsWith("prelim-")) return "prelim";
  return "main";
}

export function pickSetupBoutSectionLabel(boutId: string) {
  const section = pickSetupBoutSection(boutId);
  if (section === "main-event") return "MAIN EVENT";
  if (section === "early-prelim") return "EARLY PRELIMS";
  if (section === "prelim") return "PRELIMS";
  return "MAIN CARD";
}

export function pickSetupDraftCardLabel(draft: PickSetupDraft) {
  if (draft.sport === "football") return "WEEKLY SLATE";
  return draft.bouts.some((bout) => {
    const section = pickSetupBoutSection(bout.boutId);
    return section === "prelim" || section === "early-prelim";
  }) ? "FULL CARD" : "MAIN CARD";
}
