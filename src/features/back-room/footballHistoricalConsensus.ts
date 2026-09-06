const PFR_WEIGHT = 0.70;
const RANKER_TOP_50_WEIGHT = 0.30;

export const PFR_HOF_MONITOR_QB_FIELD_SIZE = 250;
export const RANKER_QB_FIELD_SIZE = 70;
export const RANKER_QB_MODIFIER_MAX_RANK = 50;
export const NFL_QB_CONSENSUS_SNAPSHOT_DATE = "2026-09-05";
export const PFR_HOF_MONITOR_QB_SOURCE_URL = "https://www.pro-football-reference.com/hof/hofm_QB.htm";
export const RANKER_QB_SOURCE_URL = "https://www.ranker.com/list/the-best-quarterbacks-of-all-time/ranker-nfl";

export interface HistoricalRankSource {
  rank: number;
  fieldSize: number;
}

export interface HistoricalConsensusInput {
  pfr?: HistoricalRankSource;
  ranker?: HistoricalRankSource;
  currentCareer?: boolean;
  auditedPercentile?: number;
}

export interface HistoricalConsensusResolution {
  score: number | null;
  calculationSource: "pfr-ranker" | "pfr-only" | "manual-audit" | "unresolved";
  requiresAudit: boolean;
  pfrPercentile: number | null;
  rankerPercentile: number | null;
}

function assertPercentile(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`Historical percentile must be between 0 and 100; received ${value}`);
  }
}

export function historicalRankPercentile(rank: number, fieldSize: number) {
  if (!Number.isInteger(rank) || !Number.isInteger(fieldSize) || fieldSize < 2 || rank < 1 || rank > fieldSize) {
    throw new Error(`Invalid historical rank ${rank} for field size ${fieldSize}`);
  }
  return 100 * (fieldSize - rank) / (fieldSize - 1);
}

export function resolveHistoricalConsensus(input: HistoricalConsensusInput): HistoricalConsensusResolution {
  const pfrPercentile = input.pfr ? historicalRankPercentile(input.pfr.rank, input.pfr.fieldSize) : null;
  const rankerEligible = input.ranker != null && input.ranker.rank <= RANKER_QB_MODIFIER_MAX_RANK;
  const rankerPercentile = rankerEligible
    ? historicalRankPercentile(input.ranker!.rank, PFR_HOF_MONITOR_QB_FIELD_SIZE)
    : null;
  const requiresAudit = Boolean(input.currentCareer) || pfrPercentile == null;

  if (!requiresAudit && pfrPercentile != null) {
    if (rankerPercentile != null) {
      return {
        score: pfrPercentile * PFR_WEIGHT + rankerPercentile * RANKER_TOP_50_WEIGHT,
        calculationSource: "pfr-ranker",
        requiresAudit: false,
        pfrPercentile,
        rankerPercentile,
      };
    }
    return {
      score: pfrPercentile,
      calculationSource: "pfr-only",
      requiresAudit: false,
      pfrPercentile,
      rankerPercentile: null,
    };
  }

  if (input.auditedPercentile != null) {
    assertPercentile(input.auditedPercentile);
    return {
      score: input.auditedPercentile,
      calculationSource: "manual-audit",
      requiresAudit: true,
      pfrPercentile,
      rankerPercentile,
    };
  }

  return {
    score: null,
    calculationSource: "unresolved",
    requiresAudit: true,
    pfrPercentile,
    rankerPercentile,
  };
}

interface QbSourceSnapshot {
  pfrRank?: number;
  rankerRank?: number;
  currentCareer?: boolean;
}

// Static, dated source evidence. PFR Hall of Fame Monitor is the backbone.
// A credible Ranker top-50 placement may modify that baseline; Ranker 51-70 is ignored.
// Missing Ranker never becomes zero and never penalizes a retired QB with a valid PFR rank.
// Current/incomplete careers and PFR-missing identities are resolved only by the explicit audit below.
const NFL_QB_SOURCE_SNAPSHOT: Readonly<Record<string, QbSourceSnapshot>> = {
  "tom-brady": { pfrRank: 1, rankerRank: 1 },
  "peyton-manning": { pfrRank: 2, rankerRank: 2 },
  "aaron-rodgers": { pfrRank: 3, rankerRank: 3, currentCareer: true },
  "brett-favre": { pfrRank: 4, rankerRank: 6 },
  "johnny-unitas": { pfrRank: 5, rankerRank: 5 },
  "joe-montana": { pfrRank: 6, rankerRank: 8 },
  "dan-marino": { pfrRank: 9, rankerRank: 4 },
  "steve-young": { pfrRank: 11, rankerRank: 7 },
  "matthew-stafford": { pfrRank: 12, currentCareer: true },
  "patrick-mahomes": { pfrRank: 13, rankerRank: 10, currentCareer: true },
  "matt-ryan": { pfrRank: 14, rankerRank: 25 },
  "russell-wilson": { pfrRank: 19, rankerRank: 16 },
  "lamar-jackson": { pfrRank: 24, rankerRank: 22, currentCareer: true },
  "ken-stabler": { pfrRank: 26, rankerRank: 14 },
  "sonny-jurgensen": { pfrRank: 27, rankerRank: 23 },
  "warren-moon": { pfrRank: 29, rankerRank: 11 },
  "len-dawson": { pfrRank: 32, rankerRank: 18 },
  "nfl-josh-allen": { pfrRank: 34, currentCareer: true },
  "nflverse-player-00-0011024": { pfrRank: 42, rankerRank: 26 },
  "nflverse-player-00-0001361": { pfrRank: 49, rankerRank: 27 },
  "carson-palmer": { pfrRank: 50, rankerRank: 29 },
  "nflverse-player-00-0033106": { pfrRank: 51, currentCareer: true },
  "nflverse-player-00-0033077": { pfrRank: 54, currentCareer: true },
  "nfl-jalen-hurts": { pfrRank: 59, currentCareer: true },
  "nflverse-player-00-0002110": { pfrRank: 67, rankerRank: 37 },
  "nflverse-player-00-0008442": { pfrRank: 69, rankerRank: 58 },
  "nflverse-player-00-0005755": { pfrRank: 70, rankerRank: 42 },
  "andy-dalton": { pfrRank: 71, rankerRank: 49, currentCareer: true },
  "nflverse-player-00-0006355": { pfrRank: 72, rankerRank: 48 },
  "nflverse-player-00-0007091": { pfrRank: 73, rankerRank: 39 },
  "nflverse-player-00-0003739": { pfrRank: 75, rankerRank: 35 },
  "nflverse-player-00-0029701": { pfrRank: 78 },
  "jay-cutler": { pfrRank: 82 },
  "nflverse-player-00-0034855": { pfrRank: 86, currentCareer: true },
  "andrew-luck": { pfrRank: 87, rankerRank: 21 },
  "nflverse-player-00-0036355": { pfrRank: 93, rankerRank: 45, currentCareer: true },
  "ryan-fitzpatrick": { pfrRank: 100 },
  "nflverse-player-00-0035228": { pfrRank: 101, currentCareer: true },
  "nflverse-player-00-0034869": { pfrRank: 106, currentCareer: true },
  "nflverse-player-00-0036442": { pfrRank: 109, currentCareer: true },
  "nflverse-player-00-0033537": { pfrRank: 116, rankerRank: 63, currentCareer: true },
  "nflverse-player-00-0001823": { pfrRank: 119 },
  "carson-wentz": { pfrRank: 120, currentCareer: true },
  "nflverse-player-00-0030565": { pfrRank: 129, currentCareer: true },
  "marcus-mariota": { pfrRank: 131, currentCareer: true },
  "nflverse-player-00-0006423": { pfrRank: 134 },
  "nflverse-player-00-0019559": { pfrRank: 137, rankerRank: 54 },
  "nflverse-player-00-0036971": { pfrRank: 139, currentCareer: true },
  "nflverse-player-00-0036212": { pfrRank: 140, currentCareer: true },
  "nflverse-player-00-0028118": { pfrRank: 142, currentCareer: true },
  "nflverse-player-00-0035710": { pfrRank: 145, currentCareer: true },
  "nflverse-player-00-0031237": { pfrRank: 147, currentCareer: true },
  "nflverse-player-00-0006300": { pfrRank: 148, rankerRank: 64 },
  "nflverse-player-00-0031345": { pfrRank: 149, currentCareer: true },
  "nflverse-player-00-0023662": { pfrRank: 150 },
  "nflverse-player-00-0027974": { pfrRank: 153 },
  "nflverse-player-00-0023460": { pfrRank: 155 },
  "nflverse-player-00-0020608": { pfrRank: 158 },
  "sam-bradford": { pfrRank: 160 },
  "mitchell-trubisky": { pfrRank: 163, currentCareer: true },
  "nflverse-player-00-0033119": { pfrRank: 166, currentCareer: true },
  "nflverse-player-00-0036264": { pfrRank: 167, currentCareer: true },
  "nflverse-player-00-0005180": { pfrRank: 171 },
  "nflverse-player-00-0023541": { pfrRank: 172 },
  "nflverse-player-00-0021206": { pfrRank: 173 },
  "nflverse-player-00-0024218": { pfrRank: 175, rankerRank: 60 },
};

// Explicit manual audit placement for the exact 122-QB runtime pool. This is not an automatic
// fallback or a second formula. It is consulted only for current/incomplete careers or PFR-missing identities.
export const NFL_QB_MANUAL_AUDIT_ORDER = [
  "tom-brady",
  "peyton-manning",
  "patrick-mahomes",
  "aaron-rodgers",
  "johnny-unitas",
  "joe-montana",
  "brett-favre",
  "dan-marino",
  "drew-brees",
  "john-elway",
  "steve-young",
  "roger-staubach",
  "matthew-stafford",
  "lamar-jackson",
  "ben-roethlisberger",
  "dan-fouts",
  "kurt-warner",
  "nfl-josh-allen",
  "terry-bradshaw",
  "philip-rivers",
  "matt-ryan",
  "russell-wilson",
  "ken-stabler",
  "warren-moon",
  "troy-aikman",
  "eli-manning",
  "ken-anderson",
  "len-dawson",
  "sonny-jurgensen",
  "nflverse-player-00-0011024",
  "donovan-mcnabb",
  "bob-griese",
  "cam-newton",
  "joe-namath",
  "nflverse-player-00-0005741",
  "tony-romo",
  "carson-palmer",
  "nflverse-player-00-0001361",
  "joe-flacco",
  "andrew-luck",
  "kirk-cousins",
  "nflverse-player-00-0003739",
  "nflverse-player-00-0033106",
  "nflverse-player-00-0033077",
  "nflverse-player-00-0006355",
  "nflverse-player-00-0005755",
  "nflverse-player-00-0002110",
  "nflverse-player-00-0023436",
  "nflverse-player-00-0007091",
  "andy-dalton",
  "nflverse-player-00-0016193",
  "nfl-jalen-hurts",
  "nflverse-player-00-0036442",
  "nflverse-player-00-0036355",
  "derek-carr",
  "nflverse-player-00-0008442",
  "nflverse-player-00-0029701",
  "jay-cutler",
  "nflverse-player-00-0020245",
  "nflverse-player-00-0003292",
  "nflverse-player-00-0034855",
  "nflverse-player-00-0019559",
  "jameis-winston",
  "nflverse-player-00-0001823",
  "nflverse-player-00-0022787",
  "nflverse-player-00-0004161",
  "nflverse-player-00-0019599",
  "nflverse-player-00-0013042",
  "ryan-fitzpatrick",
  "nflverse-player-00-0029567",
  "nflverse-player-00-0027974",
  "nflverse-player-00-0033537",
  "nflverse-player-00-0035228",
  "nflverse-player-00-0037834",
  "nflverse-player-00-0036212",
  "sam-bradford",
  "nflverse-player-00-0030565",
  "nflverse-player-00-0036971",
  "nflverse-player-00-0006423",
  "carson-wentz",
  "nflverse-player-00-0021231",
  "nflverse-player-00-0031345",
  "nflverse-player-00-0023541",
  "nflverse-player-00-0028118",
  "nflverse-player-00-0023662",
  "nflverse-player-00-0006300",
  "nflverse-player-00-0005589",
  "nflverse-player-00-0009311",
  "nflverse-player-00-0039163",
  "nflverse-player-00-0036264",
  "marcus-mariota",
  "nflverse-player-00-0034869",
  "nflverse-player-00-0028986",
  "nflverse-player-00-0021206",
  "nflverse-player-00-0026625",
  "nflverse-player-00-0031237",
  "nflverse-player-00-0039732",
  "nflverse-player-00-0039910",
  "nflverse-player-00-0039918",
  "nflverse-player-00-0035710",
  "nflverse-player-00-0035289",
  "nflverse-player-00-0033119",
  "nflverse-player-00-0020608",
  "nflverse-player-00-0026993",
  "nflverse-player-00-0026898",
  "nflverse-player-00-0024218",
  "nflverse-player-00-0023460",
  "nflverse-player-00-0027948",
  "nflverse-player-00-0022177",
  "nflverse-player-00-0003535",
  "nflverse-player-00-0023645",
  "nflverse-player-00-0026197",
  "nflverse-player-00-0036972",
  "nflverse-player-00-0031407",
  "nflverse-player-00-0021141",
  "nflverse-player-00-0005180",
  "nflverse-player-00-0027688",
  "nflverse-player-00-0022121",
  "nflverse-player-00-0022164",
  "nflverse-player-00-0027876",
  "mitchell-trubisky",
  "johnny-manziel",
] as const;

const manualAuditRankById = new Map<string, number>(NFL_QB_MANUAL_AUDIT_ORDER.map((id, index) => [id, index + 1]));

function manualAuditPercentile(subjectId: string) {
  const rank = manualAuditRankById.get(subjectId);
  if (!rank) return null;
  return historicalRankPercentile(rank, NFL_QB_MANUAL_AUDIT_ORDER.length);
}

export function getNflQbHistoricalConsensus(subjectId: string): HistoricalConsensusResolution {
  const source = NFL_QB_SOURCE_SNAPSHOT[subjectId];
  const pfr = source?.pfrRank
    ? { rank: source.pfrRank, fieldSize: PFR_HOF_MONITOR_QB_FIELD_SIZE }
    : undefined;
  const ranker = source?.rankerRank
    ? { rank: source.rankerRank, fieldSize: RANKER_QB_FIELD_SIZE }
    : undefined;
  const base = resolveHistoricalConsensus({ pfr, ranker, currentCareer: source?.currentCareer });
  if (!base.requiresAudit) return base;

  const auditedPercentile = manualAuditPercentile(subjectId);
  if (auditedPercentile == null) return base;
  return resolveHistoricalConsensus({
    pfr,
    ranker,
    currentCareer: source?.currentCareer,
    auditedPercentile,
  });
}
