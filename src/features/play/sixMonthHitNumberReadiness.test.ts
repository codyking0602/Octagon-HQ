import { describe, expect, it } from "vitest";
import { buildOfficialDailySetup, OFFICIAL_DAILY_RUNTIME_VERSION } from "./todaysChallengeRuntime";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationHitNumber";
import { footballHitTheNumberSubjects, FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG } from "../back-room/footballHitTheNumberModel";
import {
  createSixMonthReadyUfcOfficialHitNumberPlan,
  HIT_THE_NUMBER_DAILY_CONTENT_VERSION,
  UFC_OFFICIAL_HIT_NUMBER_POOL_SIZES,
} from "./hitTheNumberDailyRuntime";
import { hitTheNumberRandomPoolQuality } from "./hitTheNumberPoolQuality";
import { hitTheNumberStatRows, HIT_THE_NUMBER_STATS } from "./hitTheNumberEngine";
import { auditMergedPartOneCalendar } from "./sixMonthDailyRotationAudit";

type Obj = Record<string, unknown>;
function children(setup: { publicSetup: Obj; privateSetupEvidence: Obj; privateGradingEvidence: Obj }) {
  const rounds = setup.privateSetupEvidence.rounds;
  if (!Array.isArray(rounds)) return [setup];
  return rounds.map((row: Obj) => ({
    publicSetup: row.public_setup as Obj,
    privateSetupEvidence: row.private_setup_evidence as Obj,
    privateGradingEvidence: row.private_grading_evidence as Obj,
  }));
}
function fighterIds(setup: Obj) {
  const candidates = setup.candidates as Array<{ id: string }> | undefined;
  return candidates ? candidates.map(row => row.id) : setup.fighterIds as string[];
}
const expectedChoices: Record<number, number> = { 4: 12, 5: 14, 6: 16 };

describe("six-month Official Hit the Number seed/content audit (merged canonical Part 1 dates)", () => {
  it("generates distinct, fact-backed, solvable 4–6-pick Football and UFC boards at planned 2x demand", () => {
    const slots = auditMergedPartOneCalendar().filter(slot =>
      slot.game === "hit_the_number" && (slot.sport === "football" || slot.sport === "ufc"));
    const fullBoards = new Set<string>();
    const subjectMetric = new Map<string, number>();
    const report = {
      scheduledDates: { football: 0, ufc: 0 },
      childBoards: { football: 0, ufc: 0 },
      uniqueBoards: { football: 0, ufc: 0 },
      formats: {} as Record<string, number>,
      picks: {} as Record<string, number>,
      largestRepeatedSubjectMetric: 0,
      metrics: {} as Record<string, number>,
      inventory: {
        footballSubjects: footballHitTheNumberSubjects.length,
        footballNflSubjects: footballHitTheNumberSubjects.filter(subject => subject.league === "NFL").length,
        footballCfbSubjects: footballHitTheNumberSubjects.filter(subject => subject.league === "CFB").length,
        footballMetrics: FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.length,
        ufcLedgerFighters: hitTheNumberStatRows.length,
        ufcMetricDefinitions: HIT_THE_NUMBER_STATS.length,
        ufcStatCoverage: Object.fromEntries(HIT_THE_NUMBER_STATS.map(stat => [stat.id,
          hitTheNumberStatRows.filter(row => Number.isInteger(row.values[stat.id])).length])),
      },
    };
    const canonicalRows = new Map(hitTheNumberStatRows.map(row => [row.fighterId, row.values]));
    for (const slot of slots) {
      const sport = slot.sport === "football" ? "football" : "ufc";
      const version = sport === "football"
        ? slot.day === "2026-10-25" ? "football-daily-v20-resume-v18-oct3" : "football-daily-v21-locked-oct25"
        : "ufc-daily-v21-48h-oct25";
      report.scheduledDates[sport]++;
      const publication = slot.sport === "football"
        ? buildFootballDailyPersistenceSetup(slot.day, version, "hit_the_number")
        : buildOfficialDailySetup("hit_the_number", slot.day, version);
      const boards = children(publication);
      expect(boards).toHaveLength(2);
      for (const [boardIndex, child] of boards.entries()) {
        const pub = child.publicSetup;
        const count = Number(pub.pick_count ?? pub.pickCount);
        const ids = fighterIds(pub);
        const stat = String(pub.metric_id ?? pub.statId);
        const target = Number(pub.target);
        const values = child.privateGradingEvidence.values as Record<string, number>;
        report.childBoards[sport]++;
        report.metrics[sport + ":" + stat] = (report.metrics[sport + ":" + stat] ?? 0) + 1;
        expect([4, 5, 6], slot.sport + ":" + slot.day).toContain(count);
        expect(Number.isFinite(target) && target > 0, `${sport}:${slot.day}:board-${boardIndex + 1}:${stat}:${target}`).toBe(true);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.length).toBeGreaterThan(count);
        if (slot.sport === "football" || pub.boardType === "random-pool") {
          expect(ids).toHaveLength(expectedChoices[count]);
        }
        const format = String(pub.format_id ?? (pub.format as Obj)?.formatId ?? "classic");
        report.formats[slot.sport + ":" + format] = (report.formats[slot.sport + ":" + format] ?? 0) + 1;
        report.picks[slot.sport + ":" + count] = (report.picks[slot.sport + ":" + count] ?? 0) + 1;
        const key = [slot.sport, stat, target, count, ...[...ids].sort()].join("|");
        expect(fullBoards.has(key), "Duplicated entire board on " + slot.day).toBe(false);
        fullBoards.add(key);
        report.uniqueBoards[sport]++;
        for (const id of ids) {
          expect(Number.isFinite(values[id]), "Missing stat for " + id + "/" + stat).toBe(true);
          const factId = [slot.sport, stat, id].join(":");
          const number = (subjectMetric.get(factId) ?? 0) + 1;
          subjectMetric.set(factId, number);
          report.largestRepeatedSubjectMetric = Math.max(report.largestRepeatedSubjectMetric, number);
        }
        if (slot.sport === "football") {
          const plan = child.privateSetupEvidence.plan as {
            solutionSubjectIds: string[]; target: number; league: string; metricId: string;
          };
          expect(plan).toBeTruthy();
          expect(["NFL", "CFB"]).toContain(plan.league);
          expect(plan.metricId).toBe(stat);
          expect(plan.solutionSubjectIds).toHaveLength(count);
          expect(plan.solutionSubjectIds.every(id => ids.includes(id))).toBe(true);
          expect(plan.solutionSubjectIds.reduce((sum, id) => sum + values[id]!, 0)).toBeCloseTo(target, 5);
        } else {
          const seedVersion = boardIndex === 0 ? version : version + ":game-2";
          const seed = [HIT_THE_NUMBER_DAILY_CONTENT_VERSION, OFFICIAL_DAILY_RUNTIME_VERSION,
            "hit-the-number", seedVersion, slot.day].join("|");
          const plan = createSixMonthReadyUfcOfficialHitNumberPlan(seed, pub.boardType as "open-roster" | "random-pool");
          expect(plan.statId).toBe(stat);
          expect(plan.target).toBe(target);
          expect(plan.pickCount).toBe(count);
          expect(plan.solutionFighterIds.every(id => ids.includes(id))).toBe(true);
          expect(plan.solutionFighterIds.reduce((sum, id) => sum + canonicalRows.get(id)![plan.statId]!, 0)).toBe(target);
          expect(plan.fighterIds).toEqual(ids);
          if (pub.boardType === "random-pool") {
            expect(ids).toHaveLength(UFC_OFFICIAL_HIT_NUMBER_POOL_SIZES[count as 4 | 5 | 6]);
            expect(hitTheNumberRandomPoolQuality(plan).passes).toBe(true);
          }
        }
      }
    }
    // Any failure in this test blocks prospective 2x content signoff, not old results.
    expect(report.scheduledDates.football).toBe(13);
    expect(report.scheduledDates.ufc).toBe(6);
    expect(report.uniqueBoards).toEqual(report.childBoards);
    console.info("SIX_MONTH_HIT_NUMBER_CANONICAL_PART1_AUDIT " + JSON.stringify(report));
  }, 180_000);
});
