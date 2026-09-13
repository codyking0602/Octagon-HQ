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
export const FOOTBALL_BUILD_QB_RESEARCH_SNAPSHOT_DATE = "2026-09-12" as const;
export const FOOTBALL_BUILD_QB_RESEARCH_SOURCES = [
  { id: "canonical-football-facts", evidenceType: "statistics", source: "Octagon HQ canonical Football factual ledger" },
  { id: "pfr-any-a", evidenceType: "statistics", source: "Pro Football Reference adjusted passing efficiency" },
  { id: "pfr-comebacks", evidenceType: "high-leverage", source: "Pro Football Reference fourth-quarter comebacks" },
  { id: "pfr-game-winning-drives", evidenceType: "high-leverage", source: "Pro Football Reference game-winning drives" },
  { id: "espn-goat-index", evidenceType: "historical-evaluation", source: "ESPN coach/executive historical QB evaluation" },
  { id: "espn-qb-council-2022", evidenceType: "film-scouting", source: "ESPN QB Council trait scouting" },
  { id: "espn-qb-traits-2024", evidenceType: "film-scouting", source: "ESPN 2024 QB trait scouting" },
  { id: "espn-qb-traits-2025", evidenceType: "film-scouting", source: "ESPN 2025 QB trait scouting" },
  { id: "nfl-strongest-arms-history", evidenceType: "film-history", source: "NFL historical arm-talent review" },
  { id: "nfl-strongest-arms-2014", evidenceType: "film-scouting", source: "NFL arm-strength scouting" },
  { id: "nfl-100-quarterbacks", evidenceType: "historical-evaluation", source: "NFL 100 all-time quarterback panel" },
] as const;

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
  yardsPerAttempt: number | null;
  passingYardsPerGame: number | null;
  passingTouchdownsPerGame: number | null;
  completionPercentage: number | null;
  passerRating: number | null;
  touchdownInterceptionRatio: number;
  interceptionPercentage: number | null;
  rushingYardsPerGame: number | null;
  rushingTouchdownsPerGame: number | null;
  rushingYardsPerAttempt: number | null;
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

  // Name-keyed historical anchors are used only when the canonical factual ledger
  // intentionally exposes partial pre-modern career rates. They provide film/context
  // evidence without creating a second factual-stat owner or hand-entering final grades.
  "roger staubach": { Arm: "high", Accuracy: "high", Processing: "elite", Mobility: "high", Clutch: "elite" },
  "terry bradshaw": { Arm: "high", Accuracy: "average", Processing: "plus", Mobility: "plus", Clutch: "elite" },
  "fran tarkenton": { Arm: "plus", Accuracy: "high", Processing: "high", Mobility: "elite", Clutch: "high" },
  "jim kelly": { Arm: "high", Accuracy: "high", Processing: "high", Mobility: "plus", Clutch: "high" },
  "boomer esiason": { Arm: "high", Accuracy: "high", Processing: "high", Mobility: "average", Clutch: "high" },
  "randall cunningham": { Arm: "high", Accuracy: "plus", Processing: "plus", Mobility: "rare", Clutch: "plus" },
  "steve mcnair": { Arm: "high", Accuracy: "high", Processing: "high", Mobility: "elite", Clutch: "high" },
  "rich gannon": { Arm: "average", Accuracy: "high", Processing: "elite", Mobility: "plus", Clutch: "high" },
  "drew bledsoe": { Arm: "rare", Accuracy: "plus", Processing: "plus", Mobility: "limited", Clutch: "plus" },
  "vinny testaverde": { Arm: "elite", Accuracy: "average", Processing: "average", Mobility: "average", Clutch: "plus" },
  "mark brunell": { Arm: "plus", Accuracy: "high", Processing: "high", Mobility: "high", Clutch: "plus" },
  "jim everett": { Arm: "high", Accuracy: "high", Processing: "plus", Mobility: "average", Clutch: "average" },
  "jeff george": { Arm: "rare", Accuracy: "average", Processing: "limited", Mobility: "average", Clutch: "limited" },
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
  "nfl-career-passing-yards",
  "nfl-career-passing-touchdowns",
  "nfl-career-interceptions-thrown",
] as const satisfies readonly FootballFactMetricId[];

const OPTIONAL_RATE_METRICS = [
  "nfl-career-games",
  "nfl-career-passing-completions",
  "nfl-career-passing-attempts",
] as const satisfies readonly FootballFactMetricId[];

const OPTIONAL_MOBILITY_METRICS = [
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

const BUILD_QB_GENERATION_WEIGHT_BY_QUALITY: Readonly<Record<BuildQbQualityBand, number>> = {
  marquee: 0.18,
  strong: 0.70,
  core: 1.15,
  lower: 1.25,
  wildcard: 1.00,
};

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
      { league: "NFL", includeProjectedSourceSubjects: true, includeProjectedCanonicalRecognition: true },
    );
    if (!subject || subject.startSeason == null) {
      throw new Error(`Build a QB QB ${subjectId} is missing canonical career identity`);
    }

    const metricIds = [...REQUIRED_METRICS, ...OPTIONAL_RATE_METRICS, ...OPTIONAL_MOBILITY_METRICS];
    const values = Object.fromEntries(
      metricIds.map((metricId) => [metricId, factValue(subjectId, metricId)]),
    ) as Record<(typeof metricIds)[number], number | null>;
    const missing = REQUIRED_METRICS.filter((metricId) => values[metricId] == null);
    if (missing.length) {
      throw new Error(`Build a QB QB ${subjectId} is missing canonical core facts: ${missing.join(", ")}`);
    }

    const historicalConsensus = getNflQbHistoricalConsensus(subjectId).score;
    if (historicalConsensus == null) {
      throw new Error(`Build a QB QB ${subjectId} is missing historical consensus`);
    }

    const games = values["nfl-career-games"];
    const completions = values["nfl-career-passing-completions"];
    const attempts = values["nfl-career-passing-attempts"];
    const passingYards = values["nfl-career-passing-yards"]!;
    const passingTouchdowns = values["nfl-career-passing-touchdowns"]!;
    const interceptions = values["nfl-career-interceptions-thrown"]!;
    const rushingAttempts = values["nfl-career-rushing-attempts"];
    const rushingYards = values["nfl-career-rushing-yards"];
    const rushingTouchdowns = values["nfl-career-rushing-touchdowns"];

    const hasPassingRateVolume = attempts != null && attempts > 0;
    const hasPerGameVolume = games != null && games > 0;
    let passerRating: number | null = null;
    if (hasPassingRateVolume && completions != null) {
      const a = Math.min(2.375, Math.max(0, (completions / attempts - 0.3) * 5));
      const b = Math.min(2.375, Math.max(0, (passingYards / attempts - 3) * 0.25));
      const passerTouchdown = Math.min(2.375, Math.max(0, (passingTouchdowns / attempts) * 20));
      const d = Math.min(2.375, Math.max(0, 2.375 - (interceptions / attempts) * 25));
      passerRating = ((a + b + passerTouchdown + d) / 6) * 100;
    }

    return {
      subjectId,
      name: candidate.name,
      recognizabilityTier: candidate.recognizabilityTier,
      auditIndex,
      startSeason: subject.startSeason,
      yardsPerAttempt: hasPassingRateVolume ? passingYards / attempts : null,
      passingYardsPerGame: hasPerGameVolume ? passingYards / games : null,
      passingTouchdownsPerGame: hasPerGameVolume ? passingTouchdowns / games : null,
      completionPercentage: hasPassingRateVolume && completions != null ? (completions / attempts) * 100 : null,
      passerRating,
      touchdownInterceptionRatio: passingTouchdowns / Math.max(1, interceptions),
      interceptionPercentage: hasPassingRateVolume ? (interceptions / attempts) * 100 : null,
      rushingYardsPerGame: hasPerGameVolume && rushingYards != null ? rushingYards / games : null,
      rushingTouchdownsPerGame: hasPerGameVolume && rushingTouchdowns != null ? rushingTouchdowns / games : null,
      rushingYardsPerAttempt: rushingAttempts != null && rushingAttempts > 0 && rushingYards != null
        ? rushingYards / rushingAttempts
        : null,
      historicalConsensus,
      evidenceMetricIds: metricIds.filter((metricId) => values[metricId] != null),
    };
  });
}

function weightedScore(rows: readonly { score: number | null; weight: number }[]) {
  const usable = rows.filter((row): row is { score: number; weight: number } => row.score != null);
  if (!usable.length) return null;
  return usable.reduce((sum, row) => sum + row.score * row.weight, 0)
    / usable.reduce((sum, row) => sum + row.weight, 0);
}

function normalizedScoutingName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function blendScoutingEvidence(
  statisticalScore: number | null,
  subjectId: string,
  name: string,
  trait: BuildQbTrait,
  scoutingWeight: number,
) {
  const level = SCOUTING_TRAIT_AUDIT[subjectId]?.[trait]
    ?? SCOUTING_TRAIT_AUDIT[normalizedScoutingName(name)]?.[trait];
  if (!level) return statisticalScore ?? SCOUTING_LEVEL_SCORE.average;
  const scoutingScore = SCOUTING_LEVEL_SCORE[level];
  if (statisticalScore == null) return scoutingScore;
  return statisticalScore * (1 - scoutingWeight) + scoutingScore * scoutingWeight;
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
  const value = row[metric];
  if (value == null) return null;
  const peers = (buckets.get(eraBucket(row.startSeason)) ?? [])
    .map((peer) => peer[metric])
    .filter((peerValue): peerValue is number => peerValue != null);
  if (peers.length < 2) return null;
  return scoreFootballAnchoredValue(value, peers, direction);
}

function anchoredScore(value: number | null, anchors: readonly number[]) {
  if (value == null || anchors.length < 2) return null;
  return scoreFootballAnchoredValue(value, anchors);
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
    rushingYardsPerGame: raw.map((row) => row.rushingYardsPerGame).filter((value): value is number => value != null),
    rushingTouchdownsPerGame: raw.map((row) => row.rushingTouchdownsPerGame).filter((value): value is number => value != null),
    rushingYardsPerAttempt: raw.map((row) => row.rushingYardsPerAttempt).filter((value): value is number => value != null),
  };

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
      { score: anchoredScore(row.rushingYardsPerGame, mobilityAnchors.rushingYardsPerGame), weight: 0.55 },
      { score: anchoredScore(row.rushingTouchdownsPerGame, mobilityAnchors.rushingTouchdownsPerGame), weight: 0.30 },
      { score: anchoredScore(row.rushingYardsPerAttempt, mobilityAnchors.rushingYardsPerAttempt), weight: 0.15 },
    ]);
    const clutchStat = weightedScore([
      { score: row.historicalConsensus / 100, weight: 0.55 },
      { score: eraScore(row, eraAnchors, "touchdownInterceptionRatio"), weight: 0.25 },
      { score: eraScore(row, eraAnchors, "passerRating"), weight: 0.20 },
    ]);

    const traits = {
      Arm: calibratedTraitRating(blendScoutingEvidence(armStat, row.subjectId, row.name, "Arm", 0.72)),
      Accuracy: calibratedTraitRating(blendScoutingEvidence(accuracyStat, row.subjectId, row.name, "Accuracy", 0.48)),
      Processing: calibratedTraitRating(blendScoutingEvidence(processingStat, row.subjectId, row.name, "Processing", 0.48)),
      Mobility: calibratedTraitRating(blendScoutingEvidence(mobilityStat, row.subjectId, row.name, "Mobility", 0.52)),
      Clutch: calibratedTraitRating(blendScoutingEvidence(clutchStat, row.subjectId, row.name, "Clutch", 0.52)),
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
      generationWeight: BUILD_QB_GENERATION_WEIGHT_BY_QUALITY[qualityBand],
      traits,
      overall,
      rarityBand: rarityBandForQualityBand(qualityBand),
      evidenceMetricIds: row.evidenceMetricIds,
    };
  });
}
