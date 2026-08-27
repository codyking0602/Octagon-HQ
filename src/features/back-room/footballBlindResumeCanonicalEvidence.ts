import {
  footballFactMetricDefinitions,
  formatFootballFact,
  getFootballFact,
  type FootballFactMetricId,
} from "./footballFactualStatsCore";
import {
  getFootballBlindResumeEvidenceProfilesForPack,
  type FootballBlindResumeArchetype,
  type FootballBlindResumeEvidenceRow,
} from "./footballBlindResumeEvidence";
import { getFootballSubject, type FootballSubjectProfile } from "./footballSubjectRegistry";
import type { FootballRankFivePackId } from "./footballRankFiveModel";

export interface FootballBlindResumeCanonicalEvidencePair {
  left: readonly FootballBlindResumeEvidenceRow[];
  right: readonly FootballBlindResumeEvidenceRow[];
  source: "canonical-facts" | "reviewed-enhancement";
}

const metricDefinitionById = new Map(footballFactMetricDefinitions.map((definition) => [definition.id, definition]));

const METRICS_BY_PACK: Readonly<Record<FootballRankFivePackId, readonly FootballFactMetricId[]>> = {
  "nfl-quarterbacks": [
    "nfl-career-passing-yards",
    "nfl-career-passing-touchdowns",
    "nfl-career-interceptions-thrown",
    "nfl-career-passer-rating",
    "nfl-career-completion-percentage",
    "nfl-career-passing-yards-per-attempt",
    "nfl-career-passing-touchdown-interception-ratio",
    "nfl-career-games",
    "nfl-career-passing-yards-per-game",
    "nfl-career-passing-touchdowns-per-game",
  ],
  "nfl-running-backs": [
    "nfl-career-rushing-yards",
    "nfl-career-rushing-touchdowns",
    "nfl-career-scrimmage-yards",
    "nfl-career-scrimmage-touchdowns",
    "nfl-career-rushing-yards-per-attempt",
    "nfl-career-rushing-yards-per-game",
    "nfl-career-receiving-yards-per-game",
    "nfl-career-games",
  ],
  "nfl-wide-receivers": [
    "nfl-career-receptions",
    "nfl-career-receiving-yards",
    "nfl-career-receiving-touchdowns",
  ],
  "nfl-tight-ends": [
    "nfl-career-receptions",
    "nfl-career-receiving-yards",
    "nfl-career-receiving-touchdowns",
  ],
  "nfl-defensive-players": [
    "nfl-career-sacks",
    "nfl-career-interceptions",
    "nfl-defensive-player-of-year-awards",
    "nfl-first-team-all-pros",
  ],
  "nfl-head-coaches": [],
  "nfl-qb-seasons": [
    "nfl-season-passing-yards",
    "nfl-season-passing-touchdowns",
    "nfl-season-interceptions",
    "nfl-season-passer-rating",
  ],
  "nfl-team-seasons": [
    "nfl-team-overall-wins",
    "nfl-team-overall-losses",
    "nfl-team-points-per-game",
    "nfl-team-opponent-points-per-game",
    "nfl-super-bowl-title",
  ],
  "college-quarterbacks": [
    "cfb-best-season-passing-yards",
    "cfb-best-season-passing-touchdowns",
    "cfb-best-season-interceptions",
    "cfb-best-season-passer-rating",
    "cfb-best-season-rushing-yards",
    "cfb-best-season-rushing-touchdowns",
    "cfb-heisman-awards",
  ],
  "college-head-coaches": [
    "cfb-coach-career-wins",
    "cfb-coach-career-losses",
    "cfb-coach-career-ties",
    "cfb-coach-national-titles",
    "cfb-coach-conference-titles",
  ],
  "college-programs": [
    "cfb-program-wins-since-2000",
    "cfb-program-losses-since-2000",
    "cfb-program-national-titles-since-2000",
    "cfb-program-conference-titles-since-2000",
    "cfb-program-cfp-appearances",
    "cfb-program-title-game-appearances-since-2000",
  ],
  "college-program-eras": [
    "cfb-era-wins",
    "cfb-era-losses",
    "cfb-era-national-titles",
    "cfb-era-conference-titles",
    "cfb-era-cfp-appearances",
    "cfb-era-title-game-appearances",
  ],
  "college-team-seasons": [
    "cfb-team-wins",
    "cfb-team-losses",
    "cfb-team-points-for",
    "cfb-team-points-against",
    "cfb-team-points-per-game",
    "cfb-team-srs",
    "cfb-team-sos",
    "cfb-national-title",
  ],
};

type RowPair = readonly [FootballBlindResumeEvidenceRow, FootballBlindResumeEvidenceRow];

function rowPair(dimensionId: string, label: string, left: string | null, right: string | null): RowPair | null {
  if (left == null || right == null || left === "" || right === "") return null;
  return [
    { dimensionId, label, value: left },
    { dimensionId, label, value: right },
  ];
}

function number(value: number, decimals = 1) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function factPair(leftId: string, rightId: string, metricId: FootballFactMetricId): RowPair | null {
  const left = getFootballFact(leftId, metricId);
  const right = getFootballFact(rightId, metricId);
  const definition = metricDefinitionById.get(metricId);
  if (!left || !right || !definition) return null;
  return rowPair(
    metricId,
    definition.label,
    formatFootballFact(metricId, left.fact.value),
    formatFootballFact(metricId, right.fact.value),
  );
}

function subjectYears(subject: FootballSubjectProfile) {
  if (subject.startSeason == null || subject.endSeason == null) return null;
  return subject.endSeason - subject.startSeason + 1;
}

function metadataPairs(left: FootballSubjectProfile, right: FootballSubjectProfile): RowPair[] {
  const rows: (RowPair | null)[] = [
    rowPair("subject-season", "Season", left.season?.toString() ?? null, right.season?.toString() ?? null),
    rowPair(
      "subject-career-span",
      "Career span",
      left.startSeason != null && left.endSeason != null ? `${left.startSeason}–${left.endSeason}` : null,
      right.startSeason != null && right.endSeason != null ? `${right.startSeason}–${right.endSeason}` : null,
    ),
    rowPair(
      "subject-career-seasons",
      "Career seasons",
      subjectYears(left)?.toString() ?? null,
      right.startSeason != null && right.endSeason != null ? `${right.endSeason - right.startSeason + 1}` : null,
    ),
    rowPair(
      "subject-active-decades",
      "Active decades",
      left.activeDecades?.map((decade) => `${decade}s`).join(", ") ?? null,
      right.activeDecades?.map((decade) => `${decade}s`).join(", ") ?? null,
    ),
    rowPair("subject-college", "College", left.school ?? null, right.school ?? null),
    rowPair("subject-position", "Position", left.position ?? null, right.position ?? null),
    rowPair("subject-draft-year", "Draft year", left.draftYear?.toString() ?? null, right.draftYear?.toString() ?? null),
    rowPair("subject-draft-round", "Draft round", left.draftRound?.toString() ?? null, right.draftRound?.toString() ?? null),
    rowPair("subject-draft-pick", "Draft pick", left.draftPick?.toString() ?? null, right.draftPick?.toString() ?? null),
    rowPair("subject-conference", "Conference", left.conference ?? null, right.conference ?? null),
  ];
  return rows.filter((row): row is RowPair => row != null);
}

function values(subjectId: string, metricIds: readonly FootballFactMetricId[]) {
  return new Map(metricIds.flatMap((metricId) => {
    const fact = getFootballFact(subjectId, metricId);
    return fact ? [[metricId, fact.fact.value] as const] : [];
  }));
}

function derivedPairs(packId: FootballRankFivePackId, leftId: string, rightId: string): RowPair[] {
  const metricIds = METRICS_BY_PACK[packId];
  const left = values(leftId, metricIds);
  const right = values(rightId, metricIds);
  const pair = (
    dimensionId: string,
    label: string,
    compute: (factValues: ReadonlyMap<FootballFactMetricId, number>) => number | null,
    suffix = "",
    decimals = 1,
  ) => {
    const leftValue = compute(left);
    const rightValue = compute(right);
    return rowPair(
      dimensionId,
      label,
      leftValue == null ? null : `${number(leftValue, decimals)}${suffix}`,
      rightValue == null ? null : `${number(rightValue, decimals)}${suffix}`,
    );
  };
  const ratio = (numerator: FootballFactMetricId, denominator: FootballFactMetricId, scale = 1) =>
    (facts: ReadonlyMap<FootballFactMetricId, number>) => {
      const top = facts.get(numerator);
      const bottom = facts.get(denominator);
      return top == null || bottom == null || bottom === 0 ? null : (top / bottom) * scale;
    };
  const sum = (a: FootballFactMetricId, b: FootballFactMetricId) =>
    (facts: ReadonlyMap<FootballFactMetricId, number>) => {
      const first = facts.get(a);
      const second = facts.get(b);
      return first == null || second == null ? null : first + second;
    };
  const difference = (a: FootballFactMetricId, b: FootballFactMetricId) =>
    (facts: ReadonlyMap<FootballFactMetricId, number>) => {
      const first = facts.get(a);
      const second = facts.get(b);
      return first == null || second == null ? null : first - second;
    };

  if (packId === "nfl-wide-receivers" || packId === "nfl-tight-ends") {
    return [
      pair("receiving-yards-per-catch", "Receiving yards per catch", ratio("nfl-career-receiving-yards", "nfl-career-receptions")),
      pair("receiving-td-per-100-catches", "Receiving TD per 100 catches", ratio("nfl-career-receiving-touchdowns", "nfl-career-receptions", 100)),
      pair("receiving-yards-per-td", "Receiving yards per TD", ratio("nfl-career-receiving-yards", "nfl-career-receiving-touchdowns")),
      pair("catches-per-receiving-td", "Catches per receiving TD", ratio("nfl-career-receptions", "nfl-career-receiving-touchdowns")),
    ].filter((row): row is RowPair => row != null);
  }
  if (packId === "nfl-defensive-players") {
    return [
      pair("defensive-impact-total", "Sacks + interceptions", sum("nfl-career-sacks", "nfl-career-interceptions")),
      pair("defensive-sack-int-margin", "Sack / interception margin", difference("nfl-career-sacks", "nfl-career-interceptions")),
      pair("defensive-sack-share", "Sack share of tracked impact plays", (facts) => {
        const sacks = facts.get("nfl-career-sacks");
        const interceptions = facts.get("nfl-career-interceptions");
        if (sacks == null || interceptions == null || sacks + interceptions === 0) return null;
        return (sacks / (sacks + interceptions)) * 100;
      }, "%"),
      pair("defensive-int-share", "Interception share of tracked impact plays", (facts) => {
        const sacks = facts.get("nfl-career-sacks");
        const interceptions = facts.get("nfl-career-interceptions");
        if (sacks == null || interceptions == null || sacks + interceptions === 0) return null;
        return (interceptions / (sacks + interceptions)) * 100;
      }, "%"),
    ].filter((row): row is RowPair => row != null);
  }
  if (packId === "nfl-qb-seasons") {
    return [
      pair("season-td-int-ratio", "TD-to-INT ratio", ratio("nfl-season-passing-touchdowns", "nfl-season-interceptions"), "", 2),
      pair("season-td-int-margin", "TD minus interceptions", difference("nfl-season-passing-touchdowns", "nfl-season-interceptions"), "", 0),
      pair("season-yards-per-td", "Passing yards per TD", ratio("nfl-season-passing-yards", "nfl-season-passing-touchdowns")),
    ].filter((row): row is RowPair => row != null);
  }
  if (packId === "nfl-team-seasons") {
    return [
      pair("nfl-team-win-pct", "Win percentage", (facts) => {
        const wins = facts.get("nfl-team-overall-wins");
        const losses = facts.get("nfl-team-overall-losses");
        return wins == null || losses == null || wins + losses === 0 ? null : (wins / (wins + losses)) * 100;
      }, "%"),
      pair("nfl-team-scoring-margin", "Scoring margin per game", difference("nfl-team-points-per-game", "nfl-team-opponent-points-per-game")),
      rowPair(
        "nfl-team-record",
        "Record",
        left.has("nfl-team-overall-wins") && left.has("nfl-team-overall-losses") ? `${left.get("nfl-team-overall-wins")}-${left.get("nfl-team-overall-losses")}` : null,
        right.has("nfl-team-overall-wins") && right.has("nfl-team-overall-losses") ? `${right.get("nfl-team-overall-wins")}-${right.get("nfl-team-overall-losses")}` : null,
      ),
    ].filter((row): row is RowPair => row != null);
  }
  if (packId === "college-quarterbacks") {
    return [
      pair("cfb-season-td-int-ratio", "Passing TD-to-INT ratio", ratio("cfb-best-season-passing-touchdowns", "cfb-best-season-interceptions"), "", 2),
      pair("cfb-season-td-int-margin", "Passing TD minus interceptions", difference("cfb-best-season-passing-touchdowns", "cfb-best-season-interceptions"), "", 0),
      pair("cfb-season-yards-per-pass-td", "Passing yards per TD", ratio("cfb-best-season-passing-yards", "cfb-best-season-passing-touchdowns")),
      pair("cfb-passing-td-per-1000-yards", "Passing TD per 1,000 yards", ratio("cfb-best-season-passing-touchdowns", "cfb-best-season-passing-yards", 1000), "", 2),
      pair("cfb-interceptions-per-1000-yards", "Interceptions per 1,000 yards", ratio("cfb-best-season-interceptions", "cfb-best-season-passing-yards", 1000), "", 2),
      pair("cfb-total-qb-touchdowns", "Passing + rushing TD", sum("cfb-best-season-passing-touchdowns", "cfb-best-season-rushing-touchdowns"), "", 0),
    ].filter((row): row is RowPair => row != null);
  }
  if (packId === "college-head-coaches") {
    return [
      pair("cfb-coach-win-pct", "Career win percentage", (facts) => {
        const wins = facts.get("cfb-coach-career-wins");
        const losses = facts.get("cfb-coach-career-losses");
        const ties = facts.get("cfb-coach-career-ties");
        return wins == null || losses == null || ties == null || wins + losses + ties === 0
          ? null
          : ((wins + ties * 0.5) / (wins + losses + ties)) * 100;
      }, "%"),
      pair("cfb-coach-title-total", "National + conference titles", sum("cfb-coach-national-titles", "cfb-coach-conference-titles"), "", 0),
    ].filter((row): row is RowPair => row != null);
  }
  if (packId === "college-programs") {
    return [
      pair("cfb-program-win-pct", "Win percentage since 2000", (facts) => {
        const wins = facts.get("cfb-program-wins-since-2000");
        const losses = facts.get("cfb-program-losses-since-2000");
        return wins == null || losses == null || wins + losses === 0 ? null : (wins / (wins + losses)) * 100;
      }, "%"),
      pair("cfb-program-title-total", "National + conference titles", sum("cfb-program-national-titles-since-2000", "cfb-program-conference-titles-since-2000"), "", 0),
    ].filter((row): row is RowPair => row != null);
  }
  if (packId === "college-program-eras") {
    return [
      pair("cfb-era-win-pct", "Era win percentage", (facts) => {
        const wins = facts.get("cfb-era-wins");
        const losses = facts.get("cfb-era-losses");
        return wins == null || losses == null || wins + losses === 0 ? null : (wins / (wins + losses)) * 100;
      }, "%"),
      pair("cfb-era-title-total", "Era national + conference titles", sum("cfb-era-national-titles", "cfb-era-conference-titles"), "", 0),
    ].filter((row): row is RowPair => row != null);
  }
  if (packId === "college-team-seasons") {
    return [
      pair("cfb-team-win-pct", "Win percentage", (facts) => {
        const wins = facts.get("cfb-team-wins");
        const losses = facts.get("cfb-team-losses");
        return wins == null || losses == null || wins + losses === 0 ? null : (wins / (wins + losses)) * 100;
      }, "%"),
      pair("cfb-team-point-differential", "Point differential", difference("cfb-team-points-for", "cfb-team-points-against"), "", 0),
      rowPair(
        "cfb-team-record",
        "Record",
        left.has("cfb-team-wins") && left.has("cfb-team-losses") ? `${left.get("cfb-team-wins")}-${left.get("cfb-team-losses")}` : null,
        right.has("cfb-team-wins") && right.has("cfb-team-losses") ? `${right.get("cfb-team-wins")}-${right.get("cfb-team-losses")}` : null,
      ),
    ].filter((row): row is RowPair => row != null);
  }
  return [];
}

function canonicalPair(
  packId: FootballRankFivePackId,
  leftId: string,
  rightId: string,
): FootballBlindResumeCanonicalEvidencePair | null {
  const leftSubject = getFootballSubject(leftId);
  const rightSubject = getFootballSubject(rightId);
  if (!leftSubject || !rightSubject) return null;

  const pairs: RowPair[] = [
    ...METRICS_BY_PACK[packId]
      .map((metricId) => factPair(leftId, rightId, metricId))
      .filter((row): row is RowPair => row != null),
    ...derivedPairs(packId, leftId, rightId),
    ...metadataPairs(leftSubject, rightSubject),
  ];
  const unique = pairs.filter(
    (row, index) => pairs.findIndex((candidate) => candidate[0].dimensionId === row[0].dimensionId) === index,
  );
  if (unique.length < 8) return null;
  const selected = unique.slice(0, 8);
  return {
    left: selected.map((row) => row[0]),
    right: selected.map((row) => row[1]),
    source: "canonical-facts",
  };
}

function reviewedPair(
  packId: FootballRankFivePackId,
  leftId: string,
  rightId: string,
  archetype: FootballBlindResumeArchetype,
): FootballBlindResumeCanonicalEvidencePair | null {
  const profiles = getFootballBlindResumeEvidenceProfilesForPack(packId);
  const left = profiles.find((profile) => profile.subjectId === leftId);
  const right = profiles.find((profile) => profile.subjectId === rightId);
  if (!left || !right || left.archetype !== archetype || right.archetype !== archetype) return null;
  if (left.league !== right.league || left.evidence.length !== 8 || right.evidence.length !== 8) return null;
  return { left: left.evidence, right: right.evidence, source: "reviewed-enhancement" };
}

/**
 * Blind Resume membership is decided before this function is called by the shared canonical A-C comparison query.
 * Canonical facts/relationships are the primary eight-row generator. Existing reviewed packets may only enhance
 * a matching canonical subject pair when the current fact universe cannot yet produce eight aligned rows.
 */
export function buildFootballBlindResumeCanonicalEvidencePair(
  packId: FootballRankFivePackId,
  leftId: string,
  rightId: string,
  archetype: FootballBlindResumeArchetype,
) {
  return canonicalPair(packId, leftId, rightId) ?? reviewedPair(packId, leftId, rightId, archetype);
}
