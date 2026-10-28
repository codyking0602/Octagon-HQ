// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FOOTBALL_GM_CAP, FOOTBALL_GM_ROSTER_SLOTS } from "./footballGmEngine";
import {
  NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS, NFL_GM_LONG_SLOT_LABELS,
  nflGmLongValidRoster,
} from "./footballGmLongFoundation";
import {
  NFL_GM_LONG_BY_ID, NFL_GM_LONG_PLAYER_POOL,
  nflGmLongAutoAddPick, nflGmLongTeamCandidates,
} from "./footballGmLongCatalog";
import {
  LongCapMeter, LongCandidateBoard, LongRosterGrid,
} from "./FootballGmLongDraftPresentation";

afterEach(cleanup);

describe("Long GM parity with proven Short GM draft", () => {
  it("keeps Short's canonical cap, positions, and seven-slot gameplay untouched", () => {
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toHaveLength(7);
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
    expect(NFL_GM_LONG_SLOTS).toHaveLength(9);
    expect(Object.keys(NFL_GM_LONG_SLOT_LABELS)).toHaveLength(9);
  });

  it("renders the exact Short GM cap / roster hierarchy with nine positions", () => {
    const { container } = render(<>
      <LongCapMeter picks={[]} />
      <LongRosterGrid picks={[]} />
    </>);
    expect(container.querySelector(".football-gm__cap")).not.toBeNull();
    expect(container.querySelector(".football-gm__roster")).not.toBeNull();
    expect(container.querySelectorAll(".football-gm__roster-grid article")).toHaveLength(9);
    expect(screen.getByText("9-MAN CORE")).toBeTruthy();
    expect(screen.getByText("$205M LEFT")).toBeTruthy();
    expect(screen.getByText("0/9")).toBeTruthy();
  });

  it("uses Short's position tabs, headshots, hidden ratings and scout pills for OL", () => {
    const team = "BUF";
    const ol = nflGmLongTeamCandidates(team, []).find(item => item.player.family === "OL");
    expect(ol).toBeDefined();
    const onPick = vi.fn();
    const { container } = render(<LongCandidateBoard teamCode={team} picks={[]} onPick={onPick} />);
    expect(container.querySelector(".football-gm__picker")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "OL" }));
    expect(container.querySelectorAll(".football-wheel-picker__candidates button").length).toBeGreaterThan(0);
    expect(container.querySelector(".football-gm__quality-pill")).not.toBeNull();
    expect(container.querySelector(".football-gm__outlook-pill")).not.toBeNull();
    expect(container.querySelector(".football-gm__candidate-tags")).not.toBeNull();
    expect(container.querySelector(".football-wheel-picker__headshot")).not.toBeNull();
    const chosen = container.querySelector(".football-wheel-picker__candidates button")!;
    fireEvent.click(chosen);
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(chosen.textContent).not.toMatch(/\b(?:9[0-9]|8[0-9]) OVR\b/);
  });

  it("auto-fits the drafted player and keeps Short's WR/FLEX preference", () => {
    const wr = NFL_GM_LONG_PLAYER_POOL.filter(player =>
      player.family === "WR" && player.eligibleSlots.includes("WR"))
      .sort((a, b) => a.salaryWindow[0] - b.salaryWindow[0]);
    const first = wr[0]!;
    const firstPicks = nflGmLongAutoAddPick([], first.id);
    expect(firstPicks).toEqual([{ slot: "WR", playerId: first.id }]);
    const second = wr.find(player => player.id !== first.id
      && player.name !== first.name
      && nflGmLongTeamCandidates(player.team, firstPicks).some(item => item.player.id === player.id));
    expect(second).toBeDefined();
    const next = nflGmLongAutoAddPick(firstPicks, second!.id);
    expect(next.map(pick => pick.slot).sort()).toEqual(["FLEX", "WR"]);
    expect(nflGmLongValidRoster(next, NFL_GM_LONG_BY_ID)).toBe(true);
    const strongestId = first.currentGrade >= second!.currentGrade ? first.id : second!.id;
    expect(next.find(pick => pick.slot === "WR")?.playerId).toBe(strongestId);
  });

  it("displays actual roster scouting pills and contract/reprice status", () => {
    const ol = NFL_GM_LONG_PLAYER_POOL.find(p => p.family === "OL" && p.salaryWindow[0] <= 30_000_000)!;
    const picks = nflGmLongAutoAddPick([], ol.id);
    const { container } = render(<LongRosterGrid picks={picks} />);
    expect(container.querySelectorAll(".football-gm__roster-grid article")).toHaveLength(9);
    expect(container.querySelector(".football-gm__roster-player")).not.toBeNull();
    expect(container.querySelector(".football-gm__player-headshot")).not.toBeNull();
    expect(container.querySelector(".football-gm__quality-pill")).not.toBeNull();
    expect(container.querySelector(".football-gm__outlook-pill")).not.toBeNull();
    expect(container.querySelector(".football-gm__roster-reprice")).not.toBeNull();
  });
});
