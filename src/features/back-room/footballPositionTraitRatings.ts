import { buildFootballComparisonCandidatePool } from "./footballComparisonAuthority";
import { getFootballFact, type FootballFactMetricId } from "./footballFactualStatsCore";
import { getNflQbHistoricalConsensus } from "./footballHistoricalConsensus";
import {
  footballRankingRatingForScore,
  scoreFootballAnchoredValue,
} from "./footballRankingFramework";
import { resolveFootballSubjectReference } from "./footballSubjectRegistry";
import { BUILD_QB_TRAITS, type BuildQbTrait } from "../play/draftRoomContract";

export const FOOTBALL_POSITION_TRAIT_MODEL_VERSION = "build-qb-v1" as const;

export interface FootballBuildQbTraitProfile {
  subjectId: string;
  name: string;
  recognizabilityTier: "A" | "B";
  traits: Readonly<Record<BuildQbTrait, number>>;
  overall: number;
  rarityBand: 1 | 2 | 3 | 4 | 5;
  evidenceMetricIds: readonly FootballFactMetricId[];
}

interface RawQbTraitSignals {
  subjectId: string;
  name: string;
  recognizabilityTier: "A" | "B";
  yardsPerAttempt: number;
  passingYardsPerGame: number;
  passingTouchdownsPerGame: number;
  completionPercentage: number;
  passerRating: number;
  touchdownInterceptionRatio: number;
  interceptionPercentage: number;
  rushingYardsPerGame: number;
  rushingTouchdownsPerGame: number;
  rushingYardsPerAttempt: number;
  historicalConsensus: number;
  evidenceMetricIds: readonly FootballFactMetricId[];
}

const REQUIRED_METRICS = [
  "nfl-career-games",
  "nfl-career-passing-completions",
  "nfl-career-passing-attempts",
  "nfl-career-passing-yards",
  "nfl-career-passing-touchdowns",
  "nfl-career-interceptions-thrown",
  "nfl-career-rushing-attempts",
  "nfl-career-rushing-yards",
  "nfl-career-rushing-touchdowns",
] as const satisfies readonly FootballFactMetricId[];

function factValue(subjectId: string, metricId: FootballFactMetricId) {
  return getFootballFact(subjectId, metricId)?.fact.value ?? null;
}

function passerRating(
  completions: number,
  attempts: number,
  yards: number,
  touchdowns: number,
  interceptions: number,
) {
  const a = Math.min(2.375, Math.max(0, (completions / attempts - 0.3) * 5));
  const b = Math.min(2.375, Math.max(0, (yards / attempts - 3) * 0.25));
  const c = Math.min(2.375, Math.max(0, (touchdowns / attempts) * 20));
  const d = Math.min(2.375, Math.max(0, 2.375 - (interceptions / attempts) * 25));
  return ((a + b + c + d) / 6) * 100;
}

function rawBuildQbSignals(): RawQbTraitSignals[] {
  const uniqueCandidates = new Map(
    buildFootballComparisonCandidatePool("nfl-quarterbacks")
      .filter((candidate) => candidate.recognizabilityTier === "A" || candidate.recognizabilityTier === "B")
      .map((candidate) => [candidate.canonicalSubjectId, candidate]),
  );

  return [...uniqueCandidates.values()].flatMap((candidate) => {
    if (candidate.recognizabilityTier !== "A" && candidate.recognizabilityTier !== "B") return [];

    const subject = resolveFootballSubjectReference(
      candidate.canonicalSubjectId,
      candidate.name,
      { kind: "player-career", league: "NFL", position: "QB" },
    );
    if (!subject || (subject.startSeason ?? 0) < 2000) return [];

    const values = REQUIRED_METRICS.map((metricId) => factValue(candidate.canonicalSubjectId, metricId));
    if (values.some((value) => value == null)) return [];

    const [
      games,
      completions,
      attempts,
      passingYards,
      passingTouchdowns,
      interceptions,
      rushingAttempts,
      rushingYards,
      rushingTouchdowns,
    ] = values as number[];

    if (games < 50 || attempts <= 0 || rushingAttempts < 0) return [];

    const historicalConsensus = getNflQbHistoricalConsensus(candidate.canonicalSubjectId).score;
    if (historicalConsensus == null) return [];

    return [{
      subjectId: candidate.canonicalSubjectId,
      name: candidate.name,
      recognizabilityTier: candidate.recognizabilityTier,
      yardsPerAttempt: passingYards / attempts,
      passingYardsPerGame: passingYards / games,
      passingTouchdownsPerGame: passingTouchdowns / games,
      completionPercentage: (completions / attempts) * 100,
      passerRating: passerRating(completions, attempts, passingYards, passingTouchdowns, interceptions),
      touchdownInterceptionRatio: passingTouchdowns / Math.max(1, interceptions),
      interceptionPercentage: (interceptions / attempts) * 100,
      rushingYardsPerGame: rushingYards / games,
      rushingTouchdownsPerGame: rushingTouchdowns / games,
      rushingYardsPerAttempt: rushingAttempts > 0 ? rushingYards / rushingAttempts : 0,
      historicalConsensus,
      evidenceMetricIds: REQUIRED_METRICS,
    }];
  });
}

function weightedScore(rows: readonly { score: number; weight: number }[]) {
  return rows.reduce((sum, row) => sum + row.score * row.weight, 0)
    / rows.reduce((sum, row) => sum + row.weight, 0);
}

function rarityBand(overall: number): 1 | 2 | 3 | 4 | 5 {
  if (overall >= 90) return 5;
  if (overall >= 82) return 4;
  if (overall >= 72) return 3;
  if (overall >= 62) return 2;
  return 1;
}

/**
 * Canonical Build-a-QB position model.
 *
 * The trait model consumes only the existing Football comparison membership,
 * recognizability, factual ledger, historical-consensus owner, and shared
 * ranking calibration helpers. Draft Room never owns a parallel ratings table.
 *
 * "Clutch" is intentionally anchored primarily to the canonical historical QB
 * consensus (which carries career/postseason/accolade context), then lightly
 * tempered by efficiency evidence. It is a game trait, not a new all-time rank.
 */
export function buildFootballBuildQbTraitProfiles(): readonly FootballBuildQbTraitProfile[] {
  const raw = rawBuildQbSignals();
  const anchors = {
    yardsPerAttempt: raw.map((row) => row.yardsPerAttempt),
    passingYardsPerGame: raw.map((row) => row.passingYardsPerGame),
    passingTouchdownsPerGame: raw.map((row) => row.passingTouchdownsPerGame),
    completionPercentage: raw.map((row) => row.completionPercentage),
    passerRating: raw.map((row) => row.passerRating),
    touchdownInterceptionRatio: raw.map((row) => row.touchdownInterceptionRatio),
    interceptionPercentage: raw.map((row) => row.interceptionPercentage),
    rushingYardsPerGame: raw.map((row) => row.rushingYardsPerGame),
    rushingTouchdownsPerGame: raw.map((row) => row.rushingTouchdownsPerGame),
    rushingYardsPerAttempt: raw.map((row) => row.rushingYardsPerAttempt),
  };

  return raw.map((row) => {
    const arm = footballRankingRatingForScore(weightedScore([
      { score: scoreFootballAnchoredValue(row.yardsPerAttempt, anchors.yardsPerAttempt), weight: 0.45 },
      { score: scoreFootballAnchoredValue(row.passingYardsPerGame, anchors.passingYardsPerGame), weight: 0.30 },
      { score: scoreFootballAnchoredValue(row.passingTouchdownsPerGame, anchors.passingTouchdownsPerGame), weight: 0.25 },
    ]));
    const accuracy = footballRankingRatingForScore(weightedScore([
      { score: scoreFootballAnchoredValue(row.completionPercentage, anchors.completionPercentage), weight: 0.55 },
      { score: scoreFootballAnchoredValue(row.passerRating, anchors.passerRating), weight: 0.45 },
    ]));
    const processing = footballRankingRatingForScore(weightedScore([
      { score: scoreFootballAnchoredValue(row.touchdownInterceptionRatio, anchors.touchdownInterceptionRatio), weight: 0.45 },
      { score: scoreFootballAnchoredValue(row.interceptionPercentage, anchors.interceptionPercentage, "lower"), weight: 0.30 },
      { score: scoreFootballAnchoredValue(row.passerRating, anchors.passerRating), weight: 0.25 },
    ]));
    const mobility = footballRankingRatingForScore(weightedScore([
      { score: scoreFootballAnchoredValue(row.rushingYardsPerGame, anchors.rushingYardsPerGame), weight: 0.55 },
      { score: scoreFootballAnchoredValue(row.rushingTouchdownsPerGame, anchors.rushingTouchdownsPerGame), weight: 0.30 },
      { score: scoreFootballAnchoredValue(row.rushingYardsPerAttempt, anchors.rushingYardsPerAttempt), weight: 0.15 },
    ]));
    const clutch = footballRankingRatingForScore(weightedScore([
      { score: row.historicalConsensus / 100, weight: 0.65 },
      { score: scoreFootballAnchoredValue(row.passerRating, anchors.passerRating), weight: 0.20 },
      { score: scoreFootballAnchoredValue(row.touchdownInterceptionRatio, anchors.touchdownInterceptionRatio), weight: 0.15 },
    ]));

    const traits = {
      Arm: arm,
      Accuracy: accuracy,
      Processing: processing,
      Mobility: mobility,
      Clutch: clutch,
    } satisfies Record<BuildQbTrait, number>;
    const overall = Math.round(BUILD_QB_TRAITS.reduce((sum, trait) => sum + traits[trait], 0) / BUILD_QB_TRAITS.length);

    return {
      subjectId: row.subjectId,
      name: row.name,
      recognizabilityTier: row.recognizabilityTier,
      traits,
      overall,
      rarityBand: rarityBand(overall),
      evidenceMetricIds: row.evidenceMetricIds,
    };
  }).sort((left, right) => right.overall - left.overall || left.name.localeCompare(right.name));
}
