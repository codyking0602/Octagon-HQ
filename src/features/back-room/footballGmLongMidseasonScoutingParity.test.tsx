// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { NFL_GM_LONG_BY_ID, NFL_GM_LONG_PLAYER_POOL } from "./footballGmLongCatalog";
import {
  NFL_GM_LONG_SLOTS, NFL_GM_LONG_CAP, nflGmLongValidRoster, type NflGmLongPick,
} from "./footballGmLongFoundation";
import {
  nflGmLongActiveGrade, nflGmLongCreateMidseason, nflGmLongDevelopmentOutcome,
  nflGmLongPlayoffOutlook, nflGmLongTradeTargets,
} from "./footballGmLongMidseason";
import { FootballGmLongMidseasonPage } from "./FootballGmLongMidseasonPage";
import { FOOTBALL_GM_CAP, FOOTBALL_GM_ROSTER_SLOTS } from "./footballGmEngine";

const named = (name: string) => {
  const row = NFL_GM_LONG_PLAYER_POOL.find(p => p.name === name);
  if (!row) throw Error("Missing existing GM player " + name);
  return row.id;
};
const featuredPicks: NflGmLongPick[] = [
  ["QB", "Patrick Mahomes"], ["RB", "Bijan Robinson"],
  ["WR", "Amon-Ra St. Brown"], ["FLEX", "Emeka Egbuka"],
  ["OL", "Penei Sewell"], ["DL", "Dexter Lawrence II"],
  ["LB", "Kobie Turner"], ["DB", "Evan Williams"],
  ["DB2", "Antonio Johnson"],
].map(([slot, name]) => ({ slot: slot as NflGmLongPick["slot"], playerId: named(name!) }));
const runId = "owner-2026-nine-star-midseason-calibration";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ athletes: [] }) })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("Long midseason scouting parity and win-probability calibration", () => {
  it("preserves the same nine starters and never changes Short GM's rules", () => {
    expect(nflGmLongValidRoster(featuredPicks, NFL_GM_LONG_BY_ID)).toBe(true);
    expect(featuredPicks).toHaveLength(9);
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
    expect(NFL_GM_LONG_SLOTS).toHaveLength(9);
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toHaveLength(7);
  });

  it("does not report 100% playoff qualification for a 5-3 elite core", () => {
    const mid = nflGmLongCreateMidseason(runId, featuredPicks, "Dan Campbell");
    const screenshotRecord = {
      ...mid, games: mid.games.map((g, i) => ({ ...g, won: i < 5 })),
    };
    expect(nflGmLongActiveGrade(featuredPicks, screenshotRecord)).toBeGreaterThan(88);
    const outlook = nflGmLongPlayoffOutlook(runId, featuredPicks, "Dan Campbell", screenshotRecord);
    expect(outlook.percent).toBeGreaterThan(50);
    expect(outlook.percent).toBeLessThan(100);
    const weaker = { ...mid, games: mid.games.map(g => ({ ...g, won: false })) };
    expect(outlook.percent).toBeGreaterThan(
      nflGmLongPlayoffOutlook(runId, featuredPicks, "Dan Campbell", weaker).percent);
    expect(nflGmLongPlayoffOutlook(runId, featuredPicks, "Dan Campbell", screenshotRecord))
      .toEqual(outlook);
  });

  it("uses Short-style plain-English development outcomes, never numeric deltas", () => {
    expect(nflGmLongDevelopmentOutcome(4)).toBe("MAJOR IMPROVEMENT");
    expect(nflGmLongDevelopmentOutcome(3)).toBe("MAJOR IMPROVEMENT");
    expect(nflGmLongDevelopmentOutcome(1)).toBe("IMPROVED");
    expect(nflGmLongDevelopmentOutcome(0)).toBe("HELD STEADY");
    expect(nflGmLongDevelopmentOutcome(-1)).toBe("REGRESSED");
    expect(nflGmLongDevelopmentOutcome(-3)).toBe("MAJOR REGRESSION");

    const base = nflGmLongCreateMidseason(runId, featuredPicks, "Dan Campbell");
    const customized = {
      ...base,
      development: base.development.map((x, i) => ({ ...x, delta: [3,1,0,-1,-2,2,0,-3,1][i]! })),
    };
    const { container } = render(<FootballGmLongMidseasonPage
      runId={runId} picks={featuredPicks} coachName="Dan Campbell"
      midseason={customized} onExplore={vi.fn()} onShop={vi.fn()}
      onSpin={() => "NYG"} onOffer={vi.fn()} onSkip={vi.fn()} />);
    const cells = [...container.querySelectorAll(".gm-long__midseason-growth-grid > div")];
    expect(cells).toHaveLength(9);
    expect(cells[0]?.textContent).toContain("MAJOR IMPROVEMENT");
    expect(cells[1]?.textContent).toContain("IMPROVED");
    expect(cells[2]?.textContent).toContain("HELD STEADY");
    expect(cells[3]?.textContent).toContain("REGRESSED");
    expect(cells[7]?.textContent).toContain("MAJOR REGRESSION");
    expect(cells.every(c => !/[+−-]\\d/.test(c.querySelector(".gm-long__midseason-outcome")?.textContent ?? ""))).toBe(true);
    expect(screen.getByText("4 Improving")).toBeTruthy();
    expect(screen.getByText("2 Steady")).toBeTruthy();
    expect(screen.getByText("3 Regressing")).toBeTruthy();
    expect(container.textContent).toContain("8 games complete · Results locked");
  });

  it("shows all four established GM scouting pills on every legal trade offer, with cap impact", () => {
    const original = nflGmLongCreateMidseason(runId, featuredPicks, "Dan Campbell");
    const playerId = named("Evan Williams");
    const options = nflGmLongTradeTargets(featuredPicks, playerId, "NYG");
    expect(options.length).toBeGreaterThan(0);
    const offers = { ...original, stage: "offers" as const, shoppedPlayerId: playerId, partnerTeam: "NYG" };
    const { container } = render(<FootballGmLongMidseasonPage
      runId={runId} picks={featuredPicks} coachName="Dan Campbell"
      midseason={offers} onExplore={vi.fn()} onShop={vi.fn()}
      onSpin={() => "NYG"} onOffer={vi.fn()} onSkip={vi.fn()} />);
    const cards = [...container.querySelectorAll<HTMLButtonElement>(".gm-long__deadline-offer-card")];
    expect(cards).toHaveLength(options.length);
    for (const card of cards) {
      expect(card.querySelectorAll(".football-gm__candidate-tags > span")).toHaveLength(4);
      expect(card.querySelector(".football-gm__quality-pill")).not.toBeNull();
      expect(card.querySelector(".football-gm__outlook-pill")).not.toBeNull();
      expect(card.querySelector(".football-gm__candidate-tags .risk-low, .football-gm__candidate-tags .risk-medium, .football-gm__candidate-tags .risk-high, .football-gm__candidate-tags .risk-locked")).not.toBeNull();
      expect(card.textContent).toMatch(/1YR|3YR/);
      expect(card.textContent).toContain("CAP IMPACT");
      expect(card.textContent).toContain("OFFER");
      expect(card.querySelector(".gm-long__deadline-offer-footer")).not.toBeNull();
      expect(card.textContent).not.toMatch(/EXACT GRADE|OVR\s*\d/);
    }
    expect(container.querySelector(".gm-long__deadline-partner-logo img")).not.toBeNull();
    expect(container.textContent).not.toMatch(/draft pick|future round/i);
  });

  it("prevents early elite OL regression rates from using full-year odds at halftime", () => {
    const penei = named("Penei Sewell");
    let drops = 0;
    for (let i = 0; i < 160; i++) {
      const mid = nflGmLongCreateMidseason("sewell-half-audit-" + i, featuredPicks, "Dan Campbell");
      const movement = mid.development.find(d => d.playerId === penei)!.delta;
      expect(movement).toBeGreaterThanOrEqual(-1);
      if (movement < 0) drops++;
    }
    expect(drops).toBeLessThan(40);
  });

  it("enforces mobile visibility for scouting chips and shopping actions", () => {
    const css = readFileSync("src/styles/football-gm-long.css", "utf8");
    expect(css).toContain(".gm-long__deadline-offers button.gm-long__deadline-offer-card");
    expect(css).toContain(".gm-long__deadline-offer-identity > .football-gm__candidate-tags");
    expect(css).toContain(".gm-long__deadline-offer-footer");
    expect(css).toContain(".gm-long__deadline-partner-logo");
    expect(css).toContain(".gm-long__midseason-trend-counts");
    expect(css).toContain(".gm-long__deadline-shop-action b { display: inline;");
  });
});
