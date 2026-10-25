import { describe, expect, it } from "vitest";
import { createFootballHigherLowerBoard } from "../back-room/footballHigherLowerModel";
import { buildNbaServerDailyPublication } from "../nba/nbaDailyServerPublication";
import { NBA_REGULAR_SEASON_LAST_DAY } from "../nba/nbaDailySchedule";
import { FOOTBALL_HIGHER_LOWER_OFFICIAL_VERSION } from "./footballHigherLowerDailyRuntime";
import { previewApprovedDailyRotation } from "./sixMonthDailyRotationAudit";

/** A two-player comparison is still a repeat if the known/hidden order is reversed. */
function undirectedPair(metric: string, left: string, right: string) {
  return [metric, ...[left, right].sort()].join("|");
}

describe("Higher or Lower six-month reverse-pair audit (no activation)", () => {
  it("probes real Football and NBA Daily board generators and reports unverified repeats", () => {
    const slots = previewApprovedDailyRotation().slots.filter(slot =>
      slot.game === "higher_lower" && slot.sport !== "ufc");
    const keys = new Map<string, string>();
    const repeats: string[] = [];
    const output = { football: { dates: 0, questions: 0, uniquePairs: 0 },
      nba: { dates: 0, questions: 0, uniquePairs: 0 }, reversedOrRepeated: 0, examples: [] as string[] };
    for (const slot of slots) {
      if (slot.sport === "nba" && slot.day > NBA_REGULAR_SEASON_LAST_DAY) continue;
      const sport = slot.sport === "football" ? "football" : "nba";
      const version = sport + "-six-month-candidate-v1-NOT-LIVE";
      const questions = slot.sport === "football"
        ? createFootballHigherLowerBoard(
            [FOOTBALL_HIGHER_LOWER_OFFICIAL_VERSION, version, slot.day].join("|"), "MIXED",
          ).questions
        : (buildNbaServerDailyPublication(slot.day, version, "higher_lower")
          .revealSetup.questions as Array<{
            known: { subjectId: string }; hidden: { subjectId: string }; metricKey?: string; category?: string;
          }>);
      expect(questions).toHaveLength(10);
      output[sport].dates++;
      for (const question of questions) {
        output[sport].questions++;
        const key = sport + "|" + undirectedPair(
          "metricKey" in question && question.metricKey
            ? question.metricKey : ("category" in question ? String(question.category) : "unknown"),
          question.known.subjectId, question.hidden.subjectId,
        );
        if (keys.has(key)) repeats.push(slot.day + ":" + key + " (first " + keys.get(key) + ")");
        else keys.set(key, slot.day);
      }
    }
    output.football.uniquePairs = [...keys.keys()].filter(key => key.startsWith("football|")).length;
    output.nba.uniquePairs = [...keys.keys()].filter(key => key.startsWith("nba|")).length;
    output.reversedOrRepeated = repeats.length;
    output.examples = repeats.slice(0, 20);
    expect(output.football.questions).toBe(130);
    expect(output.nba.questions).toBe(60);
    // Explicitly a PROBE, not certification: Football's content owner must
    // resolve these repeats and validate concepts before schedule activation.
    console.info("SIX_MONTH_HIGHER_LOWER_PROVISIONAL_AUDIT " + JSON.stringify(output));
  }, 90_000);
});
