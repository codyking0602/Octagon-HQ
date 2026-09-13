import { buildFootballComparisonCandidatePool } from "./footballComparisonAuthority";
import { getFootballFact, type FootballFactMetricId } from "./footballFactualStatsCore";
import { getNflQbHistoricalConsensus } from "./footballHistoricalConsensus";
import { BUILD_QB_TRAITS, type BuildQbTrait } from "../play/draftRoomContract";

export const FOOTBALL_POSITION_TRAIT_MODEL_VERSION = "build-qb-v2" as const;
export const BUILD_QB_MATURE_POOL_SIZE = 60 as const;
export const FOOTBALL_BUILD_QB_RESEARCH_SNAPSHOT_DATE = "2026-09-12" as const;

export const FOOTBALL_BUILD_QB_RESEARCH_SOURCES = [
  { id: "canonical-football-facts", evidenceType: "statistics", source: "Octagon HQ canonical Football factual ledger" },
  { id: "pfr-any-a", evidenceType: "statistics", source: "https://www.pro-football-reference.com/leaders/pass_adj_net_yds_per_att_career.htm" },
  { id: "pfr-comebacks", evidenceType: "high-leverage", source: "https://www.pro-football-reference.com/leaders/comebacks_career.htm" },
  { id: "pfr-game-winning-drives", evidenceType: "high-leverage", source: "https://www.pro-football-reference.com/leaders/gwd_career.htm" },
  { id: "espn-goat-index", evidenceType: "historical-evaluation", source: "https://www.espn.com/nfl/story/_/id/20096209/nfl-coaches-execs-rank-best-quarterbacks-modern-era-2017" },
  { id: "espn-qb-council-2022", evidenceType: "film-scouting", source: "https://www.espn.com/nfl/story/_/id/34408660/nfl-quarterback-council-2022-ranking-top-10-qbs-arm-strength-accuracy-decision-making-rushing-ability-more" },
  { id: "espn-qb-traits-2024", evidenceType: "film-scouting", source: "https://www.espn.com/nfl/story/_/id/40674690/2024-ranking-best-nfl-quarterbacks-top-10-trait-skill-arm-accuracy-rushing" },
  { id: "espn-qb-traits-2025", evidenceType: "film-scouting", source: "https://www.espn.com/nfl/story/_/id/45913841/2025-ranking-best-nfl-quarterbacks-top-10-trait-skill-arm-accuracy-rushing" },
  { id: "nfl-strongest-arms-history", evidenceType: "film-history", source: "https://www.nfl.com/videos/strongest-arms-in-nfl-history-nfl-throwback" },
  { id: "nfl-strongest-arms-2014", evidenceType: "film-scouting", source: "https://www.nfl.com/news/matthew-stafford-leads-list-of-top-10-strongest-arms-0ap3000000400156" },
  { id: "nfl-100-quarterbacks", evidenceType: "historical-evaluation", source: "https://www.nfl.com/news/nfl-s-all-time-team-tom-brady-joe-montana-top-quarterbacks-0ap3000001091999" },
] as const;

type BuildQbResearchLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type BuildQbRarityBand = 1 | 2 | 3 | 4 | 5;
export type BuildQbQualityBand = "marquee" | "strong" | "core" | "lower" | "wildcard";

interface BuildQbResearchInput {
  catalogId: string;
  name: string;
  qualityBand: BuildQbRarityBand;
  research: Readonly<Record<BuildQbTrait, BuildQbResearchLevel>>;
}

export interface FootballBuildQbTraitProfile {
  subjectId: string;
  name: string;
  recognizabilityTier: "A" | "B" | "C";
  qualityBand: BuildQbQualityBand;
  generationClass: `qb-${BuildQbQualityBand}`;
  generationWeight: number;
  traits: Readonly<Record<BuildQbTrait, number>>;
  overall: number;
  rarityBand: BuildQbRarityBand;
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

const RESEARCH_LEVEL_RATING: Readonly<Record<BuildQbResearchLevel, number>> = {
  1: 35,
  2: 42,
  3: 50,
  4: 60,
  5: 69,
  6: 78,
  7: 86,
  8: 93,
  9: 99,
};

export const BUILD_QB_GENERATION_WEIGHT_BY_RARITY: Readonly<Record<BuildQbRarityBand, number>> = {
  1: 1.00,
  2: 1.25,
  3: 1.15,
  4: 0.70,
  5: 0.18,
};

const BUILD_QB_RESEARCH_AUDIT: readonly BuildQbResearchInput[] = [
  { catalogId: "build-qb-tom-brady", name: "Tom Brady", qualityBand: 5, research: { Arm: 6, Accuracy: 8, Processing: 9, Mobility: 2, Clutch: 9 } },
  { catalogId: "build-qb-peyton-manning", name: "Peyton Manning", qualityBand: 5, research: { Arm: 7, Accuracy: 8, Processing: 9, Mobility: 2, Clutch: 8 } },
  { catalogId: "build-qb-joe-montana", name: "Joe Montana", qualityBand: 5, research: { Arm: 6, Accuracy: 8, Processing: 9, Mobility: 5, Clutch: 9 } },
  { catalogId: "build-qb-patrick-mahomes", name: "Patrick Mahomes", qualityBand: 5, research: { Arm: 9, Accuracy: 8, Processing: 8, Mobility: 8, Clutch: 9 } },
  { catalogId: "build-qb-aaron-rodgers", name: "Aaron Rodgers", qualityBand: 5, research: { Arm: 8, Accuracy: 9, Processing: 9, Mobility: 7, Clutch: 7 } },
  { catalogId: "build-qb-dan-marino", name: "Dan Marino", qualityBand: 5, research: { Arm: 9, Accuracy: 8, Processing: 9, Mobility: 2, Clutch: 6 } },
  { catalogId: "build-qb-drew-brees", name: "Drew Brees", qualityBand: 5, research: { Arm: 5, Accuracy: 9, Processing: 8, Mobility: 3, Clutch: 8 } },
  { catalogId: "build-qb-brett-favre", name: "Brett Favre", qualityBand: 5, research: { Arm: 9, Accuracy: 6, Processing: 5, Mobility: 6, Clutch: 7 } },
  { catalogId: "build-qb-johnny-unitas", name: "Johnny Unitas", qualityBand: 5, research: { Arm: 7, Accuracy: 7, Processing: 8, Mobility: 4, Clutch: 8 } },
  { catalogId: "build-qb-john-elway", name: "John Elway", qualityBand: 5, research: { Arm: 9, Accuracy: 6, Processing: 7, Mobility: 7, Clutch: 9 } },
  { catalogId: "build-qb-steve-young", name: "Steve Young", qualityBand: 4, research: { Arm: 7, Accuracy: 8, Processing: 8, Mobility: 8, Clutch: 8 } },
  { catalogId: "build-qb-roger-staubach", name: "Roger Staubach", qualityBand: 4, research: { Arm: 7, Accuracy: 7, Processing: 8, Mobility: 8, Clutch: 9 } },
  { catalogId: "build-qb-terry-bradshaw", name: "Terry Bradshaw", qualityBand: 4, research: { Arm: 8, Accuracy: 5, Processing: 6, Mobility: 6, Clutch: 9 } },
  { catalogId: "build-qb-fran-tarkenton", name: "Fran Tarkenton", qualityBand: 4, research: { Arm: 6, Accuracy: 7, Processing: 7, Mobility: 8, Clutch: 7 } },
  { catalogId: "build-qb-dan-fouts", name: "Dan Fouts", qualityBand: 4, research: { Arm: 8, Accuracy: 7, Processing: 8, Mobility: 3, Clutch: 6 } },
  { catalogId: "build-qb-kurt-warner", name: "Kurt Warner", qualityBand: 4, research: { Arm: 7, Accuracy: 8, Processing: 8, Mobility: 2, Clutch: 9 } },
  { catalogId: "build-qb-warren-moon", name: "Warren Moon", qualityBand: 4, research: { Arm: 9, Accuracy: 7, Processing: 7, Mobility: 6, Clutch: 6 } },
  { catalogId: "build-qb-jim-kelly", name: "Jim Kelly", qualityBand: 4, research: { Arm: 8, Accuracy: 7, Processing: 8, Mobility: 4, Clutch: 7 } },
  { catalogId: "build-qb-troy-aikman", name: "Troy Aikman", qualityBand: 4, research: { Arm: 7, Accuracy: 9, Processing: 8, Mobility: 3, Clutch: 9 } },
  { catalogId: "build-qb-ben-roethlisberger", name: "Ben Roethlisberger", qualityBand: 4, research: { Arm: 8, Accuracy: 7, Processing: 7, Mobility: 7, Clutch: 9 } },
  { catalogId: "build-qb-philip-rivers", name: "Philip Rivers", qualityBand: 4, research: { Arm: 7, Accuracy: 8, Processing: 8, Mobility: 1, Clutch: 6 } },
  { catalogId: "build-qb-matthew-stafford", name: "Matthew Stafford", qualityBand: 4, research: { Arm: 9, Accuracy: 8, Processing: 8, Mobility: 5, Clutch: 8 } },
  { catalogId: "build-qb-lamar-jackson", name: "Lamar Jackson", qualityBand: 4, research: { Arm: 7, Accuracy: 7, Processing: 8, Mobility: 9, Clutch: 8 } },
  { catalogId: "build-qb-josh-allen", name: "Josh Allen", qualityBand: 4, research: { Arm: 9, Accuracy: 7, Processing: 7, Mobility: 9, Clutch: 8 } },
  { catalogId: "build-qb-eli-manning", name: "Eli Manning", qualityBand: 3, research: { Arm: 7, Accuracy: 6, Processing: 6, Mobility: 2, Clutch: 9 } },
  { catalogId: "build-qb-matt-ryan", name: "Matt Ryan", qualityBand: 3, research: { Arm: 6, Accuracy: 8, Processing: 8, Mobility: 3, Clutch: 7 } },
  { catalogId: "build-qb-russell-wilson", name: "Russell Wilson", qualityBand: 3, research: { Arm: 8, Accuracy: 8, Processing: 6, Mobility: 8, Clutch: 8 } },
  { catalogId: "build-qb-joe-burrow", name: "Joe Burrow", qualityBand: 3, research: { Arm: 7, Accuracy: 9, Processing: 9, Mobility: 5, Clutch: 8 } },
  { catalogId: "build-qb-andrew-luck", name: "Andrew Luck", qualityBand: 3, research: { Arm: 8, Accuracy: 7, Processing: 8, Mobility: 8, Clutch: 7 } },
  { catalogId: "build-qb-cam-newton", name: "Cam Newton", qualityBand: 3, research: { Arm: 8, Accuracy: 5, Processing: 6, Mobility: 9, Clutch: 7 } },
  { catalogId: "build-qb-michael-vick", name: "Michael Vick", qualityBand: 3, research: { Arm: 9, Accuracy: 5, Processing: 5, Mobility: 9, Clutch: 5 } },
  { catalogId: "build-qb-randall-cunningham", name: "Randall Cunningham", qualityBand: 3, research: { Arm: 8, Accuracy: 6, Processing: 6, Mobility: 9, Clutch: 6 } },
  { catalogId: "build-qb-donovan-mcnabb", name: "Donovan McNabb", qualityBand: 3, research: { Arm: 7, Accuracy: 6, Processing: 7, Mobility: 8, Clutch: 7 } },
  { catalogId: "build-qb-steve-mcnair", name: "Steve McNair", qualityBand: 3, research: { Arm: 7, Accuracy: 7, Processing: 7, Mobility: 8, Clutch: 8 } },
  { catalogId: "build-qb-tony-romo", name: "Tony Romo", qualityBand: 3, research: { Arm: 6, Accuracy: 8, Processing: 8, Mobility: 6, Clutch: 6 } },
  { catalogId: "build-qb-carson-palmer", name: "Carson Palmer", qualityBand: 3, research: { Arm: 8, Accuracy: 7, Processing: 7, Mobility: 3, Clutch: 5 } },
  { catalogId: "build-qb-boomer-esiason", name: "Boomer Esiason", qualityBand: 3, research: { Arm: 7, Accuracy: 7, Processing: 7, Mobility: 4, Clutch: 7 } },
  { catalogId: "build-qb-ken-anderson", name: "Ken Anderson", qualityBand: 3, research: { Arm: 6, Accuracy: 9, Processing: 8, Mobility: 5, Clutch: 7 } },
  { catalogId: "build-qb-ken-stabler", name: "Ken Stabler", qualityBand: 3, research: { Arm: 6, Accuracy: 7, Processing: 7, Mobility: 5, Clutch: 9 } },
  { catalogId: "build-qb-joe-namath", name: "Joe Namath", qualityBand: 3, research: { Arm: 9, Accuracy: 6, Processing: 6, Mobility: 4, Clutch: 9 } },
  { catalogId: "build-qb-sonny-jurgensen", name: "Sonny Jurgensen", qualityBand: 3, research: { Arm: 8, Accuracy: 8, Processing: 8, Mobility: 3, Clutch: 6 } },
  { catalogId: "build-qb-len-dawson", name: "Len Dawson", qualityBand: 3, research: { Arm: 6, Accuracy: 8, Processing: 8, Mobility: 4, Clutch: 8 } },
  { catalogId: "build-qb-rich-gannon", name: "Rich Gannon", qualityBand: 2, research: { Arm: 5, Accuracy: 8, Processing: 8, Mobility: 6, Clutch: 6 } },
  { catalogId: "build-qb-joe-flacco", name: "Joe Flacco", qualityBand: 2, research: { Arm: 9, Accuracy: 6, Processing: 6, Mobility: 3, Clutch: 9 } },
  { catalogId: "build-qb-drew-bledsoe", name: "Drew Bledsoe", qualityBand: 2, research: { Arm: 9, Accuracy: 6, Processing: 6, Mobility: 1, Clutch: 6 } },
  { catalogId: "build-qb-daunte-culpepper", name: "Daunte Culpepper", qualityBand: 2, research: { Arm: 9, Accuracy: 6, Processing: 5, Mobility: 8, Clutch: 5 } },
  { catalogId: "build-qb-vinny-testaverde", name: "Vinny Testaverde", qualityBand: 2, research: { Arm: 8, Accuracy: 5, Processing: 5, Mobility: 4, Clutch: 6 } },
  { catalogId: "build-qb-mark-brunell", name: "Mark Brunell", qualityBand: 2, research: { Arm: 6, Accuracy: 7, Processing: 7, Mobility: 7, Clutch: 6 } },
  { catalogId: "build-qb-jim-everett", name: "Jim Everett", qualityBand: 2, research: { Arm: 7, Accuracy: 7, Processing: 6, Mobility: 4, Clutch: 5 } },
  { catalogId: "build-qb-matt-hasselbeck", name: "Matt Hasselbeck", qualityBand: 2, research: { Arm: 5, Accuracy: 7, Processing: 8, Mobility: 4, Clutch: 7 } },
  { catalogId: "build-qb-kirk-cousins", name: "Kirk Cousins", qualityBand: 2, research: { Arm: 6, Accuracy: 8, Processing: 8, Mobility: 3, Clutch: 6 } },
  { catalogId: "build-qb-dak-prescott", name: "Dak Prescott", qualityBand: 2, research: { Arm: 8, Accuracy: 7, Processing: 7, Mobility: 7, Clutch: 6 } },
  { catalogId: "build-qb-jay-cutler", name: "Jay Cutler", qualityBand: 1, research: { Arm: 9, Accuracy: 6, Processing: 4, Mobility: 6, Clutch: 5 } },
  { catalogId: "build-qb-jeff-george", name: "Jeff George", qualityBand: 1, research: { Arm: 9, Accuracy: 5, Processing: 3, Mobility: 4, Clutch: 3 } },
  { catalogId: "build-qb-justin-herbert", name: "Justin Herbert", qualityBand: 1, research: { Arm: 9, Accuracy: 8, Processing: 7, Mobility: 7, Clutch: 5 } },
  { catalogId: "build-qb-jalen-hurts", name: "Jalen Hurts", qualityBand: 1, research: { Arm: 7, Accuracy: 6, Processing: 7, Mobility: 9, Clutch: 8 } },
  { catalogId: "build-qb-kyler-murray", name: "Kyler Murray", qualityBand: 1, research: { Arm: 8, Accuracy: 7, Processing: 6, Mobility: 9, Clutch: 5 } },
  { catalogId: "build-qb-jared-goff", name: "Jared Goff", qualityBand: 1, research: { Arm: 7, Accuracy: 8, Processing: 8, Mobility: 2, Clutch: 7 } },
  { catalogId: "build-qb-baker-mayfield", name: "Baker Mayfield", qualityBand: 1, research: { Arm: 8, Accuracy: 7, Processing: 6, Mobility: 6, Clutch: 7 } },
  { catalogId: "build-qb-matt-schaub", name: "Matt Schaub", qualityBand: 1, research: { Arm: 6, Accuracy: 7, Processing: 7, Mobility: 3, Clutch: 5 } },
] as const;

function normalizedName(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function qualityBandForRarity(rarityBand: BuildQbRarityBand): BuildQbQualityBand {
  if (rarityBand === 5) return "marquee";
  if (rarityBand === 4) return "strong";
  if (rarityBand === 3) return "core";
  if (rarityBand === 2) return "lower";
  return "wildcard";
}

function researchTraitRatings(research: BuildQbResearchInput["research"]) {
  return Object.fromEntries(
    BUILD_QB_TRAITS.map((trait) => [trait, RESEARCH_LEVEL_RATING[research[trait]]]),
  ) as Record<BuildQbTrait, number>;
}

/**
 * Canonical Build a QB competitive model.
 *
 * Membership is a deliberately audited 60-QB slice of the existing canonical
 * NFL quarterback comparison pool. The research levels are evidence inputs,
 * not manually entered final grades. They encode the cross-source film,
 * scouting, statistical, era-context and high-leverage audit represented by
 * FOOTBALL_BUILD_QB_RESEARCH_SOURCES. Final trait grades are calculated from
 * the shared level calibration above. Rarity is a separate room-composition
 * input so subject quality never becomes a trait ceiling.
 */
export function buildFootballBuildQbTraitProfiles(): readonly FootballBuildQbTraitProfile[] {
  const candidates = buildFootballComparisonCandidatePool("nfl-quarterbacks");
  const candidatesByName = new Map<string, typeof candidates>();

  for (const candidate of candidates) {
    const key = normalizedName(candidate.name);
    const matches = candidatesByName.get(key) ?? [];
    candidatesByName.set(key, [...matches, candidate]);
  }

  if (BUILD_QB_RESEARCH_AUDIT.length !== BUILD_QB_MATURE_POOL_SIZE) {
    throw new Error(`Build a QB research audit must contain exactly ${BUILD_QB_MATURE_POOL_SIZE} quarterbacks`);
  }

  return BUILD_QB_RESEARCH_AUDIT.map((input) => {
    const matches = candidatesByName.get(normalizedName(input.name)) ?? [];
    if (matches.length !== 1) {
      throw new Error(
        `Build a QB research audit requires one exact canonical NFL QB for ${input.name}; found ${matches.length}`,
      );
    }
    const candidate = matches[0]!;
    if (
      candidate.recognizabilityTier !== "A"
      && candidate.recognizabilityTier !== "B"
      && candidate.recognizabilityTier !== "C"
    ) {
      throw new Error(`Build a QB QB ${input.name} is outside the canonical playable recognition floor`);
    }

    const evidenceMetricIds = REQUIRED_METRICS.filter(
      (metricId) => getFootballFact(candidate.canonicalSubjectId, metricId) != null,
    );
    const historicalConsensus = getNflQbHistoricalConsensus(candidate.canonicalSubjectId);
    if (historicalConsensus.score == null) {
      throw new Error(`Build a QB historical consensus is unresolved for ${input.name}`);
    }

    const traits = researchTraitRatings(input.research);
    const overall = Math.round(
      BUILD_QB_TRAITS.reduce((sum, trait) => sum + traits[trait], 0) / BUILD_QB_TRAITS.length,
    );
    const qualityBand = qualityBandForRarity(input.qualityBand);

    return {
      subjectId: candidate.canonicalSubjectId,
      name: candidate.name,
      recognizabilityTier: candidate.recognizabilityTier,
      qualityBand,
      generationClass: `qb-${qualityBand}`,
      generationWeight: BUILD_QB_GENERATION_WEIGHT_BY_RARITY[input.qualityBand],
      traits,
      overall,
      rarityBand: input.qualityBand,
      evidenceMetricIds,
    };
  });
}
