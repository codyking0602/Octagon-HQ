import { buildFootballComparisonCandidatePool } from "./footballComparisonAuthority";
import { getFootballFact, type FootballFactMetricId } from "./footballFactualStatsCore";
import {
  getNflQbHistoricalConsensus,
  NFL_QB_MANUAL_AUDIT_ORDER,
} from "./footballHistoricalConsensus";
import {
  footballRankingRatingForScore,
  scoreFootballAnchoredValue,
} from "./footballRankingFramework";
import { resolveFootballSubjectReference } from "./footballSubjectRegistry";
import { BUILD_QB_TRAITS, type BuildQbTrait } from "../play/draftRoomContract";

export const FOOTBALL_POSITION_TRAIT_MODEL_VERSION = "build-qb-v2" as const;
export const BUILD_QB_MATURE_POOL_SIZE = 60 as const;

export type BuildQbQualityBand = "marquee" | "strong" | "core" | "lower" | "wildcard";

export interface FootballBuildQbTraitProfile {
  subjectId: string;
  name: string;
  recognizabilityTier: "A" | "B" | "C";
  qualityBand: BuildQbQualityBand;
  generationClass: `qb-${BuildQbQualityBand}`;
  generationWeight: number;
  traits: Readonly<Record<BuildQbTrait, number>>;
  overall: number;
  rarityBand: 1 | 2 | 3 | 4 | 5;
  evidenceMetricIds: readonly FootballFactMetricId[];
}

interface RawQbTraitSignals {
  subjectId: string;
  name: string;
  recognizabilityTier: "A" | "B" | "C";
  auditIndex: number;
  startSeason: number;
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

type ScoutingLevel = "rare" | "elite" | "high" | "plus" | "average" | "limited";
type ScoutingTraitAudit = Partial<Record<BuildQbTrait, ScoutingLevel>>;

/**
 * Box-score production is not allowed to erase trait specialists. These hidden
 * film/scouting anchors are used only where broad career statistics are known
 * to understate the actual trait (raw arm, movement creation, processing, or
 * high-leverage play). They are inputs to the calculated model, never final
 * grades. The audit was cross-checked against NFL/ESPN trait scouting, the
 * canonical Football factual ledger, PFR historical context and the existing
 * dated QB historical-consensus owner.
 */
const SCOUTING_TRAIT_AUDIT: Readonly<Record<string, ScoutingTraitAudit>> = {
  "tom-brady": { Accuracy: "high", Processing: "rare", Clutch: "rare" },
  "peyton-manning": { Accuracy: "elite", Processing: "rare", Clutch: "high" },
  "nfl-patrick-mahomes": { Arm: "rare", Processing: "elite", Mobility: "high", Clutch: "rare" },
  "nfl-aaron-rodgers": { Arm: "elite", Accuracy: "elite", Processing: "elite", Mobility: "high" },
  "johnny-unitas": { Processing: "elite", Clutch: "elite" },
  "joe-montana": { Accuracy: "elite", Processing: "elite", Clutch: "rare" },
  "brett-favre": { Arm: "rare", Mobility: "plus" },
  "dan-marino": { Arm: "elite", Accuracy: "high", Processing: "elite", Clutch: "plus" },
  "drew-brees": { Accuracy: "rare", Processing: "elite" },
  "john-elway": { Arm: "rare", Mobility: "high", Clutch: "elite" },
  "steve-young": { Accuracy: "elite", Processing: "elite", Mobility: "elite", Clutch: "high" },
  "nfl-roger-staubach": { Mobility: "high", Clutch: "elite" },
  "nfl-matthew-stafford": { Arm: "elite", Accuracy: "high", Clutch: "high" },
  "ben-roethlisberger": { Arm: "high", Mobility: "high", Clutch: "high" },
  "dan-fouts": { Arm: "high", Processing: "high" },
  "kurt-warner": { Accuracy: "high", Processing: "high", Clutch: "high" },
  "nfl-josh-allen": { Arm: "rare", Mobility: "elite", Clutch: "high" },
  "nfl-terry-bradshaw": { Arm: "high", Clutch: "elite" },
  "nfl-philip-rivers": { Accuracy: "high", Processing: "high" },
  "matt-ryan": { Accuracy: "high", Processing: "high" },
  "ken-stabler": { Accuracy: "high", Processing: "high", Clutch: "high" },
  "warren-moon": { Arm: "elite", Accuracy: "high" },
  "troy-aikman": { Accuracy: "elite", Processing: "high", Clutch: "high" },
  "eli-manning": { Clutch: "elite" },
  "cam-newton": { Arm: "high", Mobility: "rare" },
  "joe-namath": { Arm: "elite", Clutch: "high" },
  "andrew-luck": { Arm: "high", Processing: "high", Mobility: "elite" },
  "nfl-lamar-jackson": { Arm: "high", Mobility: "rare" },
  "nfl-joe-burrow": { Accuracy: "elite", Processing: "high", Clutch: "high" },
  "nfl-jalen-hurts": { Mobility: "elite", Clutch: "high" },
  "jay-cutler": { Arm: "elite", Mobility: "plus" },
};

const SCOUTING_LEVEL_SCORE: Readonly<Record<ScoutingLevel, number>> = {
  rare: 1,
  elite: 0.94,
  high: 0.86,
  plus: 0.76,
  average: 0.58,
  limited: 0.40,
};

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

function qualityBandForAuditIndex(index: number): BuildQbQualityBand {
  if (index < 10) return "marquee";
  if (index < 24) return "strong";
  if (index < 42) return "core";
  if (index < 52) return "lower";
  return "wildcard";
}

function rarityBandForQualityBand(band: BuildQbQualityBand): 1 | 2 | 3 | 4 | 5 {
  if (band === "marquee") return 5;
  if (band === "strong") return 4;
  if (band === "core") return 3;
  if (band === "lower") return 2;
  return 1;
}

function eraBucket(startSeason: number) {
  if (startSeason < 1970) return "pre-1970";
  if (startSeason < 1985) return "1970-1984";
  if (startSeason < 2000) return "1985-1999";
  if (startSeason < 2015) return "2000-2014";
  return "2015-present";
}

function rawBuildQbSignals(): RawQbTraitSignals[] {
  const candidates = new Map(
    buildFootballComparisonCandidatePool("nfl-quarterbacks")
      .map((candidate) => [candidate.canonicalSubjectId, candidate]),
  );
  const targetIds = NFL_QB_MANUAL_AUDIT_ORDER.slice(0, BUILD_QB_MATURE_POOL_SIZE);

  return targetIds.map((subjectId, auditIndex) => {
    const candidate = candidates.get(subjectId);
    if (!candidate) throw new Error(`Build a QB mature pool is missing canonical QB ${subjectId}`);
    if (
      candidate.recognizabilityTier !== "A"
      && candidate.recognizabilityTier !== "B"
      && candidate.recognizabilityTier !== "C"
    ) {
      throw new Error(`Build a QB QB ${subjectId} is outside the canonical playable recognition floor`);
    }

    const subject = resolveFootballSubjectReference(
      candidate.canonicalSubjectId,
      candidate.name,
      { kind: "player-career", league: "NFL", position: "QB" },
    );
    if (!subject || subject.startSeason == null) {
      throw new Error(`Build a QB QB ${subjectId} is missing canonical career identity`);
    }

    const values = Object.fromEntries(
      REQUIRED_METRICS.map((metricId) => [metricId, factValue(subjectId, metricId)]),
    ) as Record<(typeof REQUIRED_METRICS)[number], number | null>;
    const missing = REQUIRED_METRICS.filter((metricId) => values[metricId] == null);
    if (missing.length) {
      throw new Error(`Build a QB QB ${subjectId} is missing canonical facts: ${missing.join(", ")}`);
    }

    const historicalConsensus = getNflQbHistoricalConsensus(subjectId).score;
    if (historicalConsensus == null) {
      throw new Error(`Build a QB QB ${subjectId} is missing historical consensus`);
    }

    const games = values["nfl-career-games"]!;
    const completions = values["nfl-career-passing-completions"]!;
    const attempts = values["nfl-career-passing-attempts"]!;
    const passingYards = values["nfl-career-passing-yards"]!;
    const passingTouchdowns = values["nfl-career-passing-touchdowns"]!;
    const interceptions = values["nfl-career-interceptions-thrown"]!;
    const rushingAttempts = values["nfl-career-rushing-attempts"]!;
    const rushingYards = values["nfl-career-rushing-yards"]!;
    const rushingTouchdowns = values["nfl-career-rushing-touchdowns"]!;
    if (games <= 0 || attempts <= 0) throw new Error(`Build a QB QB ${subjectId} has incomplete career volume`);

    const a = Math.min(2.375, Math.max(0, (completions / attempts - 0.3) * 5));
    const b = Math.min(2.375, Math.max(0, (passingYards / attempts - 3) * 0.25));
    const passerTouchdown = Math.min(2.375, Math.max(0, (passingTouchdowns / attempts) * 20));
    const d = Math.min(2.375, Math.max(0, 2.375 - (interceptions / attempts) * 25));

    return {
      subjectId,
      name: candidate.name,
      recognizabilityTier: candidate.recognizabilityTier,
      auditIndex,
      startSeason: subject.startSeason,
      yardsPerAttempt: passingYards / attempts,
      passingYardsPerGame: passingYards / games,
      passingTouchdownsPerGame: passingTouchdowns / games,
      completionPercentage: (completions / attempts) * 100,
      passerRating: ((a + b + passerTouchdown + d) / 6) * 100,
      touchdownInterceptionRatio: passingTouchdowns / Math.max(1, interceptions),
      interceptionPercentage: (interceptions / attempts) * 100,
      rushingYardsPerGame: rushingYards / games,
      rushingTouchdownsPerGame: rushingTouchdowns / games,
      rushingYardsPerAttempt: rushingAttempts > 0 ? rushingYards / rushingAttempts : 0,
      historicalConsensus,
      evidenceMetricIds: REQUIRED_METRICS,
    };
  });
}

function weightedScore(rows: readonly { score: number; weight: number }[]) {
  return rows.reduce((sum, row) => sum + row.score * row.weight, 0)
    / rows.reduce((sum, row) => sum + row.weight, 0);
}

function blendScoutingEvidence(
  statisticalScore: number,
  subjectId: string,
  trait: BuildQbTrait,
  scoutingWeight: number,
) {
  const level = SCOUTING_TRAIT_AUDIT[subjectId]?.[trait];
  if (!level) return statisticalScore;
  return statisticalScore * (1 - scoutingWeight) + SCOUTING_LEVEL_SCORE[level] * scoutingWeight;
}

function buildEraAnchors(raw: readonly RawQbTraitSignals[]) {
  const buckets = new Map<string, RawQbTraitSignals[]>();
  for (const row of raw) {
    const key = eraBucket(row.startSeason);
    buckets.set(key, [...(buckets.get(key) ?? []), row]);
  }
  return buckets;
}

function eraScore(
  row: RawQbTraitSignals,
  buckets: ReadonlyMap<string, readonly RawQbTraitSignals[]>,
  metric: keyof Pick<
    RawQbTraitSignals,
    | "yardsPerAttempt"
    | "passingYardsPerGame"
    | "passingTouchdownsPerGame"
    | "completionPercentage"
    | "passerRating"
    | "touchdownInterceptionRatio"
    | "interceptionPercentage"
  >,
  direction: "higher" | "lower" = "higher",
) {
  const peers = buckets.get(eraBucket(row.startSeason)) ?? [];
  return scoreFootballAnchoredValue(row[metric], peers.map((peer) => peer[metric]), direction);
}

function calibratedTraitRating(score: number) {
  // Preserve real separation without letting era/stat noise create unusable 30s/40s builds.
  return footballRankingRatingForScore(0.38 + Math.max(0, Math.min(1, score)) * 0.62);
}

/**
 * Canonical Build a QB trait model.
 *
 * Membership comes from the existing exact-id NFL QB comparison/historical
 * owners. Career production is era-normalized before rating. Film/scouting
 * anchors are hidden evidence inputs for traits that broad box-score production
 * cannot represent cleanly; they never determine subject quality bands or
 * become hand-entered final scores. All five final trait grades are calculated
 * through the shared Football 35-99 ranking calibration helper.
 */
export function buildFootballBuildQbTraitProfiles(): readonly FootballBuildQbTraitProfile[] {
  const raw = rawBuildQbSignals();
  const eraAnchors = buildEraAnchors(raw);
  const mobilityAnchors = {
    rushingYardsPerGame: raw.map((row) => row.rushingYardsPerGame),
    rushingTouchdownsPerGame: raw.map((row) => row.rushingTouchdownsPerGame),
    rushingYardsPerAttempt: raw.map((row) => row.rushingYardsPerAttempt),
  };
  const superBowlAnchors = raw.map((row) => row.superBowlTitles);

  return raw.map((row) => {
    const armStat = weightedScore([
      { score: eraScore(row, eraAnchors, "yardsPerAttempt"), weight: 0.40 },
      { score: eraScore(row, eraAnchors, "passingYardsPerGame"), weight: 0.30 },
      { score: eraScore(row, eraAnchors, "passingTouchdownsPerGame"), weight: 0.30 },
    ]);
    const accuracyStat = weightedScore([
      { score: eraScore(row, eraAnchors, "completionPercentage"), weight: 0.60 },
      { score: eraScore(row, eraAnchors, "passerRating"), weight: 0.40 },
    ]);
    const processingStat = weightedScore([
      { score: eraScore(row, eraAnchors, "touchdownInterceptionRatio"), weight: 0.45 },
      { score: eraScore(row, eraAnchors, "interceptionPercentage", "lower"), weight: 0.30 },
      { score: eraScore(row, eraAnchors, "passerRating"), weight: 0.25 },
    ]);
    const mobilityStat = weightedScore([
      { score: scoreFootballAnchoredValue(row.rushingYardsPerGame, mobilityAnchors.rushingYardsPerGame), weight: 0.55 },
      { score: scoreFootballAnchoredValue(row.rushingTouchdownsPerGame, mobilityAnchors.rushingTouchdownsPerGame), weight: 0.30 },
      { score: scoreFootballAnchoredValue(row.rushingYardsPerAttempt, mobilityAnchors.rushingYardsPerAttempt), weight: 0.15 },
    ]);
    const clutchStat = weightedScore([
      { score: row.historicalConsensus / 100, weight: 0.55 },
      { score: eraScore(row, eraAnchors, "touchdownInterceptionRatio"), weight: 0.25 },
      { score: eraScore(row, eraAnchors, "passerRating"), weight: 0.20 },
    ]);

    const traits = {
      Arm: calibratedTraitRating(blendScoutingEvidence(armStat, row.subjectId, "Arm", 0.72)),
      Accuracy: calibratedTraitRating(blendScoutingEvidence(accuracyStat, row.subjectId, "Accuracy", 0.48)),
      Processing: calibratedTraitRating(blendScoutingEvidence(processingStat, row.subjectId, "Processing", 0.48)),
      Mobility: calibratedTraitRating(blendScoutingEvidence(mobilityStat, row.subjectId, "Mobility", 0.52)),
      Clutch: calibratedTraitRating(blendScoutingEvidence(clutchStat, row.subjectId, "Clutch", 0.52)),
    } satisfies Record<BuildQbTrait, number>;

    const qualityBand = qualityBandForAuditIndex(row.auditIndex);
    const overall = Math.round(
      BUILD_QB_TRAITS.reduce((sum, trait) => sum + traits[trait], 0) / BUILD_QB_TRAITS.length,
    );

    return {
      subjectId: row.subjectId,
      name: row.name,
      recognizabilityTier: row.recognizabilityTier,
      qualityBand,
      generationClass: `qb-${qualityBand}`,
      generationWeight: 1,
      traits,
      overall,
      rarityBand: rarityBandForQualityBand(qualityBand),
      evidenceMetricIds: row.evidenceMetricIds,
    };
  });
}
