// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { FootballGmLongPhaseOneResult, nflGmLongGradeHeadline } from "./FootballGmLongPhaseOneResult";
import { NFL_GM_LONG_PLAYER_POOL, NFL_GM_LONG_BY_ID } from "./footballGmLongCatalog";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS, nflGmLongSpend, type NflGmLongPick } from "./footballGmLongFoundation";
import { NFL_GM_LONG_COACHES, nflGmLongCoachEffects } from "./footballGmLongCoaches";
import { nflGmLongCoachFit } from "./footballGmLongPresentation";
import { FOOTBALL_GM_CAP, FOOTBALL_GM_ROSTER_SLOTS } from "./footballGmEngine";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ athletes: [] }) })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function samplePicks(preferExpensive = false): NflGmLongPick[] {
  const used = new Set<string>();
  return NFL_GM_LONG_SLOTS.map(slot => {
    const eligible = NFL_GM_LONG_PLAYER_POOL
      .filter(player => player.eligibleSlots.includes(slot) && !used.has(player.id))
      .sort((a, b) => preferExpensive
        ? b.salaryWindow[1] - a.salaryWindow[1] : a.salaryWindow[0] - b.salaryWindow[0]);
    const player = eligible[0]!;
    expect(player).toBeDefined();
    used.add(player.id);
    return { slot, playerId: player.id };
  });
}

function showResult(picks: NflGmLongPick[] = samplePicks(), grade = 92.8) {
  const coach = NFL_GM_LONG_COACHES.find(row => row.name === "Dan Campbell")!;
  const roster = picks.map(pick => {
    const player = NFL_GM_LONG_BY_ID.get(pick.playerId)!;
    return { slot: pick.slot, name: player.name, grade: player.currentGrade, age: player.age };
  });
  const effects = nflGmLongCoachEffects(coach, roster);
  const coachFit = nflGmLongCoachFit(coach, roster, effects);
  return render(<FootballGmLongPhaseOneResult picks={picks} grade={grade}
    coach={coach} coachCategoryLabel="CULTURE & LEADERSHIP" coachFit={coachFit} />);
}

describe("NFL GM Long completed Phase 1 presentation", () => {
  it("makes the grade the hero and shows nine readable roster identities and tiers", () => {
    const picks = samplePicks();
    const { container } = showResult(picks);
    expect(screen.getByRole("heading", { name: "YOUR FRANCHISE IS BUILT" })).toBeTruthy();
    expect(container.querySelector(".gm-long__phase-one-grade-number")?.textContent).toBe("92.8");
    expect(screen.getByText("ELITE CONTENDER")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "YOUR STARTING NINE" })).toBeTruthy();
    const rows = container.querySelectorAll(".gm-long__summary-roster-row");
    expect(rows).toHaveLength(9);
    for (let i = 0; i < picks.length; i++) {
      const player = NFL_GM_LONG_BY_ID.get(picks[i]!.playerId)!;
      expect(rows[i]?.textContent).toContain(player.name);
      expect(rows[i]?.textContent).toContain(player.team);
      expect(rows[i]?.querySelector(".football-gm__quality-pill")).not.toBeNull();
      expect(rows[i]?.querySelector(".gm-long__summary-headshot")).not.toBeNull();
    }
    expect(screen.getByRole("heading", { name: "Dan Campbell" })).toBeTruthy();
    expect(screen.getByText(/ready for the first eight games/i)).toBeTruthy();
    expect(container.textContent).not.toMatch(/SEASON 1 FORECAST|PROJECTED WINS|16 LEAGUE SIMULATIONS|14\.6 W/i);
    expect(screen.queryByRole("button", { name: /CONTINUE TO MIDSEASON/i })).toBeNull();
  });

  it("shows a concise Year 2 over-cap alert using the actual saved nine-player salaries", () => {
    const picks = samplePicks(true);
    const estimated = nflGmLongSpend(picks, NFL_GM_LONG_BY_ID, 2);
    expect(estimated).toBeGreaterThan(NFL_GM_LONG_CAP);
    const { container } = showResult(picks);
    const warning = container.querySelector(".gm-long__summary-cap.is-over");
    expect(warning).not.toBeNull();
    expect(warning?.textContent).toMatch(/YEAR 2 CAP WATCH/);
    expect(warning?.textContent).toMatch(/OFFSEASON ROSTER MOVE/i);
    expect(warning?.textContent).toMatch(/NO CURRENT PENALTY/i);
    expect(container.querySelectorAll(".gm-long__summary-cap")).toHaveLength(1);
  });

  it("keeps good Year 2 cap estimates non-alarming", () => {
    const picks = samplePicks(false);
    expect(nflGmLongSpend(picks, NFL_GM_LONG_BY_ID, 2)).toBeLessThan(NFL_GM_LONG_CAP);
    const { container } = showResult(picks);
    expect(container.querySelector(".gm-long__summary-cap.is-over")).toBeNull();
    expect(screen.getByText(/YEAR 2 CAP ESTIMATE/)).toBeTruthy();
  });

  it("locks the no-forecast results contract, preserves separate Short economy and mobile row widths", () => {
    const page = readFileSync("src/features/back-room/FootballGmLongPage.tsx", "utf8");
    const css = readFileSync("src/styles/football-gm-long.css", "utf8");
    expect(page).not.toContain("SEASON 1 FORECAST");
    expect(page).not.toContain("footballGmSimulateLeagueSeason");
    expect(page).toContain('run.phase !== "outlook"');
    expect(page).toContain("FootballGmLongPhaseOneResult");
    expect(css).toContain(".gm-long__summary-roster-list");
    expect(css).toContain("grid-template-columns: minmax(0,1fr)");
    expect(css).toContain(".gm-long__summary-roster-identity strong");
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toHaveLength(7);
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
    expect(NFL_GM_LONG_SLOTS).toHaveLength(9);
  });

  it("distinguishes reasonable team-quality bands without making a played-season claim", () => {
    expect(nflGmLongGradeHeadline(92.8)).toBe("ELITE CONTENDER");
    expect(nflGmLongGradeHeadline(87)).toBe("STRONG CONTENDER");
    expect(nflGmLongGradeHeadline(82)).toBe("PLAYOFF-CALIBER CORE");
    expect(nflGmLongGradeHeadline(77)).toBe("FRANCHISE FOUNDATION");
  });
});
