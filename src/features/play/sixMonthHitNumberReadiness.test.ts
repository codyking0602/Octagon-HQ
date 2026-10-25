import { describe, expect, it } from "vitest";
import {
  footballHitTheNumberSubjects,
  footballHitTheNumberRandomPoolSize,
  FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG,
} from "../back-room/footballHitTheNumberModel";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationHitNumber";
import { buildOfficialDailySetup, OFFICIAL_DAILY_RUNTIME_VERSION } from "./todaysChallengeRuntime";
import {
  HIT_THE_NUMBER_DAILY_CONTENT_VERSION,
} from "./hitTheNumberDailyRuntime";
import {
  HIT_THE_NUMBER_MAX_PICKS,
  HIT_THE_NUMBER_DEFAULT_RANDOM_POOL_SIZE,
  HIT_THE_NUMBER_STATS,
  hitTheNumberStatRows,
} from "./hitTheNumberEngine";
import { createQualityGatedHitTheNumberFormatPlan } from "./hitTheNumberPoolQuality";
import { buildSixMonthRotationPreview, SIX_MONTH_PREVIEW_VERSION } from "./sixMonthRotationPreview";

type Json = Record<string, any>;
const schedule = buildSixMonthRotationPreview();
function json(value: unknown): Json {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Six-month audit expected a publication object.");
  }
  return value as Json;
}
function childRounds(publication: { privateSetupEvidence: unknown; publicSetup: unknown }) {
  const privateSetup = json(publication.privateSetupEvidence);
  const publicSetup = json(publication.publicSetup);
  const privateRounds = privateSetup.rounds;
  const publicRounds = publicSetup.rounds;
  if (!Array.isArray(privateRounds) || !Array.isArray(publicRounds) ||
      privateRounds.length !== 2 || publicRounds.length !== 2) {
    throw new Error("Hit the Number Daily must contain exactly two actual playable boards.");
  }
  return privateRounds.map((row: unknown, index: number) => ({
    privateRound: json(row),
    publicRound: json(publicRounds[index]),
  }));
}
function lineupFingerprint(metric: string, ids: readonly string[], context: string) {
  return [context, metric, [...ids].sort().join("|")].join(":");
}
function overlap(a: readonly string[], b: readonly string[]) {
  const bSet = new Set(b);
  return a.filter((value) => bSet.has(value)).length / new Set([...a, ...b]).size;
}

describe("staged six-month Hit the Number content evidence (no live schedule cutover)", () => {
  it("generates and verifies every Football board using the canonical Official Daily generator", () => {
    const seen = new Set<string>();
    const rows: Array<{ day: string; metric: string; ids: string[]; league: string }> = [];
    const problems: string[] = [];
    const counts: Record<number, number> = {};
    const scheduled = schedule.football.filter(({ game }) => game === "hit_the_number");

    for (const { day } of scheduled) {
      const publication = buildFootballDailyPersistenceSetup(day, SIX_MONTH_PREVIEW_VERSION, "hit_the_number");
      for (const { privateRound, publicRound } of childRounds(publication)) {
        const setup = json(privateRound.private_setup_evidence);
        const grading = json(privateRound.private_grading_evidence);
        const plan = json(setup.plan);
        const publicBoard = json(publicRound);
        const pickCount = Number(plan.pickCount);
        counts[pickCount] = (counts[pickCount] ?? 0) + 1;
        const ids = plan.subjectIds as string[];
        const solution = plan.solutionSubjectIds as string[];
        const metric = String(plan.metricId);
        const league = String(plan.league);
        const values = json(grading.values);
        const fingerprint = lineupFingerprint(metric, ids, league);
        if (seen.has(fingerprint)) problems.push("Repeated Football full board: " + day);
        seen.add(fingerprint);
        if (![4, 5, 6].includes(pickCount)) problems.push("Invalid Football pick count " + day);
        if (ids.length !== footballHitTheNumberRandomPoolSize(pickCount) ||
            ids.length !== (pickCount === 4 ? 12 : pickCount === 5 ? 14 : 16)) {
          problems.push("Invalid Football pool size " + day + ": " + ids.length);
        }
        if (new Set(ids).size !== ids.length || new Set(solution).size !== solution.length ||
            solution.length !== pickCount || !solution.every((id) => ids.includes(id))) {
          problems.push("Invalid or unsolvable Football lineup: " + day);
        }
        if (solution.reduce((sum, id) => sum + Number(values[id] ?? NaN), 0) !== Number(plan.target)) {
          problems.push("Football exact target lacks canonical solution: " + day);
        }
        if (publicBoard.league !== league || !["NFL", "CFB"].includes(league)) {
          problems.push("Football league binding mismatch " + day);
        }
        rows.push({ day, metric, ids, league });
      }
    }

    const near: string[] = [];
    for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i]!, b = rows[j]!;
      if (a.league === b.league && a.metric === b.metric && overlap(a.ids, b.ids) >= 0.75) {
        near.push(a.day + " / " + b.day + " " + a.league + " " + a.metric);
      }
    }
    console.info("SIX_MONTH_FOOTBALL_HIT_NUMBER", JSON.stringify({
      inventorySubjects: footballHitTheNumberSubjects.length,
      metricConfigurations: FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.length,
      appearances: scheduled.length, boards: rows.length,
      uniqueBoards: seen.size, picks: counts, semanticNearBoards: near,
      errors: problems,
      seedNote: "Preview schedule version; not Part 1's final publication version",
    }));
    expect(problems).toEqual([]);
    expect(rows.length).toBe(scheduled.length * 2);
    expect(seen.size).toBe(rows.length);
  });

  it("inspects every UFC Official Daily board and identifies legacy rules blocking certification", () => {
    const seen = new Set<string>();
    const rows: Array<{ day: string; metric: string; ids: string[] }> = [];
    const issues: string[] = [];
    const counts: Record<number, number> = {};
    const scheduled = schedule.ufc.filter(({ game }) => game === "hit_the_number");
    for (const { day } of scheduled) {
      const publication = buildOfficialDailySetup("hit_the_number", day, SIX_MONTH_PREVIEW_VERSION);
      const rounds = childRounds(publication);
      for (const [index, { privateRound, publicRound }] of rounds.entries()) {
        const board = json(publicRound);
        const grading = json(privateRound.private_grading_evidence);
        const ids = board.fighterIds as string[];
        const pickCount = Number(board.pickCount);
        counts[pickCount] = (counts[pickCount] ?? 0) + 1;
        const metric = String(board.statId);
        const fingerprint = lineupFingerprint(metric, ids, "UFC");
        if (seen.has(fingerprint)) issues.push("Duplicate UFC full board " + day);
        seen.add(fingerprint);
        if (pickCount === 7) issues.push("Legacy 7-pick UFC board " + day);
        if (![4, 5, 6].includes(pickCount)) issues.push("Noncanonical UFC picks " + day);
        if (board.boardType === "random-pool" &&
            ids.length !== (pickCount === 4 ? 12 : pickCount === 5 ? 14 : 16)) {
          issues.push("UFC random pool lacks 12/14/16 standard " + day);
        }
        if (new Set(ids).size !== ids.length) issues.push("Duplicate UFC fighter " + day);
        // Regenerate the actual private source plan with the exact builder seed
        // rather than assuming an authored-record count proves solvability.
        const roundVersion = index === 0 ? SIX_MONTH_PREVIEW_VERSION : SIX_MONTH_PREVIEW_VERSION + ":game-2";
        const seed = [
          HIT_THE_NUMBER_DAILY_CONTENT_VERSION, OFFICIAL_DAILY_RUNTIME_VERSION,
          "hit-the-number", roundVersion, day,
        ].join("|");
        const original = createQualityGatedHitTheNumberFormatPlan({
          seed, boardType: board.boardType,
        });
        if (original.fighterIds.join("|") !== ids.join("|") ||
            original.solutionFighterIds.length !== pickCount) {
          issues.push("UFC reproducibility/solvability mismatch " + day);
        }
        const values = json(grading.values);
        const total = original.solutionFighterIds.reduce((sum, id) => sum + Number(values[id] ?? NaN), 0);
        if (total !== Number(board.target)) issues.push("UFC target cannot be met " + day);
        rows.push({ day, metric, ids });
      }
    }
    const near: string[] = [];
    for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i]!, b = rows[j]!;
      if (a.metric === b.metric && overlap(a.ids, b.ids) >= 0.75) {
        near.push(a.day + " / " + b.day + " " + a.metric);
      }
    }
    console.info("SIX_MONTH_UFC_HIT_NUMBER", JSON.stringify({
      inventoryFighterStatRows: hitTheNumberStatRows.length,
      metrics: HIT_THE_NUMBER_STATS.length,
      appearances: scheduled.length, boards: rows.length,
      uniqueBoards: seen.size, picks: counts, nearBoardMatches: near,
      legacyMaxPicks: HIT_THE_NUMBER_MAX_PICKS,
      legacyRandomPoolCap: HIT_THE_NUMBER_DEFAULT_RANDOM_POOL_SIZE,
      issues,
      status: issues.length ? "NEEDS_EXPANSION_OR_REPAIR" : "REQUIRES_FACTUAL_REVIEW",
      seedNote: "Preview schedule version; not a final source-checked content certificate",
    }));
    // A known legacy 7-pick/12-choice configuration is logged as NOT CERTIFIED.
    // Do not activate UFC Hit the Number on the proposed calendar until fixed
    // and until all source-ledger rows pass manual factual review.
    expect(rows.length).toBe(scheduled.length * 2);
    expect(seen.size).toBe(rows.length);
  });
});
