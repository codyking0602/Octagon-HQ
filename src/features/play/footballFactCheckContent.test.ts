import { describe, expect, it } from "vitest";
import {
  FACT_CHECK_DIFFICULTY_PLAN,
  buildFactCheckRun,
  isFactCheckItemActive,
} from "../games/factCheckEngine";
import {
  FOOTBALL_FACT_CHECK_BANK,
  FOOTBALL_FACT_CHECK_HAND_AUTHORED_BANK,
} from "./footballFactCheckBank";
import {
  FOOTBALL_FACT_CHECK_AUTHORITY_BANK,
  FOOTBALL_FACT_CHECK_AUTHORITY_COUNTS,
} from "./footballFactCheckAuthorityBank";
import { FOOTBALL_FACT_CHECK_WEEKLY_BANK } from "./footballFactCheckWeeklyBank";

describe("Football Fact Check content bank", () => {
  it("ships a deep launch-caliber owner bank with unique sourced facts", () => {
    expect(FOOTBALL_FACT_CHECK_HAND_AUTHORED_BANK.length).toBeGreaterThanOrEqual(40);
    expect(FOOTBALL_FACT_CHECK_AUTHORITY_COUNTS.total).toBeGreaterThanOrEqual(235);
    expect(FOOTBALL_FACT_CHECK_WEEKLY_BANK).toHaveLength(14);
    expect(FOOTBALL_FACT_CHECK_BANK.length).toBeGreaterThanOrEqual(290);
    expect(FOOTBALL_FACT_CHECK_BANK.length).toBeLessThanOrEqual(325);

    const ids = FOOTBALL_FACT_CHECK_BANK.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const item of FOOTBALL_FACT_CHECK_AUTHORITY_BANK) {
      expect(item.sourceId).toMatch(/^hq-football-/);
    }
    for (const item of FOOTBALL_FACT_CHECK_WEEKLY_BANK) {
      expect(item.sourceId).toBe("ncaa-ap-poll-through-2026-09-26");
    }
  });

  it("keeps the bank broad across all four binary formats", () => {
    const counts = new Map<string, number>();
    for (const item of FOOTBALL_FACT_CHECK_BANK) {
      counts.set(item.format, (counts.get(item.format) ?? 0) + 1);
    }

    expect(counts.get("true_false") ?? 0).toBeGreaterThanOrEqual(65);
    expect(counts.get("over_under") ?? 0).toBeGreaterThanOrEqual(80);
    expect(counts.get("either_or") ?? 0).toBeGreaterThanOrEqual(30);
    expect(counts.get("before_after") ?? 0).toBeGreaterThanOrEqual(30);
  });

  it("keeps generated answer directions balanced enough to resist pattern guessing", () => {
    const heismanFacts = FOOTBALL_FACT_CHECK_AUTHORITY_BANK.filter((item) => item.id.startsWith("canonical-cfb-heisman-"));
    const draftTierFacts = FOOTBALL_FACT_CHECK_AUTHORITY_BANK.filter((item) => item.id.startsWith("canonical-nfl-draft-tier-"));
    const chronologyFacts = FOOTBALL_FACT_CHECK_AUTHORITY_BANK.filter((item) => item.id.startsWith("canonical-draft-order-"));

    expect(heismanFacts.filter((item) => item.answer === "HEISMAN WINNER").length).toBeGreaterThanOrEqual(15);
    expect(heismanFacts.filter((item) => item.answer === "NOT A WINNER").length).toBeGreaterThanOrEqual(15);
    expect(draftTierFacts.filter((item) => item.answer === "TOP 10 PICK").length).toBeGreaterThanOrEqual(15);
    expect(draftTierFacts.filter((item) => item.answer === "PICK 11 OR LATER").length).toBeGreaterThanOrEqual(15);
    expect(chronologyFacts.filter((item) => item.answer === "BEFORE").length).toBeGreaterThanOrEqual(10);
    expect(chronologyFacts.filter((item) => item.answer === "AFTER").length).toBeGreaterThanOrEqual(10);
  });

  it("injects two current-week facts without breaking the 1-to-10 difficulty ramp", () => {
    const run = buildFactCheckRun(FOOTBALL_FACT_CHECK_BANK, {
      onDate: "2026-09-27",
      random: () => 0,
    });

    expect(run).toHaveLength(10);
    expect(run.map((item) => item.difficulty)).toEqual(FACT_CHECK_DIFFICULTY_PLAN);
    expect(run.filter((item) => item.recency === "weekly")).toHaveLength(2);
    expect(run[1]?.recency).toBe("weekly");
    expect(run[5]?.recency).toBe("weekly");
  });

  it("automatically retires the current weekly batch after its editorial window", () => {
    expect(FOOTBALL_FACT_CHECK_WEEKLY_BANK.every((item) => isFactCheckItemActive(item, "2026-10-03"))).toBe(true);
    expect(FOOTBALL_FACT_CHECK_WEEKLY_BANK.every((item) => !isFactCheckItemActive(item, "2026-10-04"))).toBe(true);

    const run = buildFactCheckRun(FOOTBALL_FACT_CHECK_BANK, {
      onDate: "2026-10-04",
      random: () => 0,
    });
    expect(run.every((item) => item.recency === "evergreen")).toBe(true);
  });

  it("deprioritizes recently seen facts when the bank has fresh alternatives", () => {
    const baseline = buildFactCheckRun(FOOTBALL_FACT_CHECK_BANK, {
      onDate: "2026-10-04",
      random: () => 0,
    });
    const recentIds = baseline.map((item) => item.id);

    const next = buildFactCheckRun(FOOTBALL_FACT_CHECK_BANK, {
      onDate: "2026-10-04",
      random: () => 0,
      recentItemIds: recentIds,
    });

    expect(next.every((item) => !recentIds.includes(item.id))).toBe(true);
  });

  it("keeps every answer binary and reveal-ready", () => {
    for (const item of FOOTBALL_FACT_CHECK_BANK) {
      expect(item.choices).toHaveLength(2);
      expect(item.choices).toContain(item.answer);
      expect(item.prompt.trim().length).toBeGreaterThan(10);
      expect(item.explanation.trim().length).toBeGreaterThan(10);
    }
  });
});
