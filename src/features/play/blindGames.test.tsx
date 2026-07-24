import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlindRankPage from "./BlindRankPage";
import BlindResumePage from "./BlindResumePage";
import {
  BLIND_RESUME_ROUNDS,
  blindResumeStats,
  blindResumeWinner,
  createBlindResumeRounds,
} from "./blindResumeEngine";
import {
  BLIND_RANK_ROLES,
  blindRankPacks,
  createBlindRankLineup,
  resolveBlindRankChallenge,
} from "./blindRankEngine";

function renderBlindResume(path = "/play/blind-resume") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BlindResumePage />
    </MemoryRouter>,
  );
}

function renderBlindRank(path = "/play/blind-rank") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BlindRankPage />
    </MemoryRouter>,
  );
}

describe("Blind Resume engine", () => {
  it("builds five deterministic, unique, same-gender matchups from one challenge seed", () => {
    const first = createBlindResumeRounds("fixed-challenge");
    const second = createBlindResumeRounds("fixed-challenge");
    expect(first).toEqual(second);
    expect(first.pairs).toHaveLength(BLIND_RESUME_ROUNDS);

    const fighterIds = first.pairs.flatMap((pair) => [pair.fighterA.id, pair.fighterB.id]);
    expect(new Set(fighterIds).size).toBe(BLIND_RESUME_ROUNDS * 2);
    expect(first.pairs.every((pair) => pair.fighterA.gender === pair.fighterB.gender)).toBe(true);
    expect(first.pairs.filter((pair) => pair.gender === "women").length).toBeLessThanOrEqual(1);
  });

  it("uses the seven approved hidden resume stats and the official board winner", () => {
    const pair = createBlindResumeRounds("stat-proof").pairs[0];
    expect(blindResumeStats(pair).map((stat) => stat.label)).toEqual([
      "UFC title-fight wins",
      "Top-5 wins",
      "Prime UFC record",
      "Apex rating",
      "Rounds won",
      "Finish rate",
      "Active elite years",
    ]);
    const winner = blindResumeWinner(pair);
    expect(winner.model.rank).toBe(Math.min(pair.fighterA.model.rank, pair.fighterB.model.rank));
  });
});

describe("Blind Resume presentation", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("reveals the fighters, verdict, and Intelligence handoff after a pick", () => {
    const { container } = renderBlindResume("/play/blind-resume?challenge=render-proof");
    expect(container.querySelectorAll(".blind-resume-stats > div")).toHaveLength(7);
    fireEvent.click(container.querySelector<HTMLButtonElement>(".blind-resume-picks button")!);
    expect(container.querySelectorAll(".blind-resume-reveal-grid article")).toHaveLength(2);
    expect(container.textContent).toContain("TAKE MATCHUP TO INTELLIGENCE");
    expect(container.textContent).toMatch(/NEXT ROUND|SEE FINAL SCORE/);
  });

  it("finishes after exactly five picks and shows the standard result actions", () => {
    const { container } = renderBlindResume("/play/blind-resume?challenge=five-round-proof");
    for (let round = 0; round < BLIND_RESUME_ROUNDS; round += 1) {
      fireEvent.click(container.querySelector<HTMLButtonElement>(".blind-resume-picks button")!);
      fireEvent.click(container.querySelector<HTMLButtonElement>(".primary-action")!);
    }
    expect(container.textContent).toContain("FIVE-ROUND RESULTS");
    const actions = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actions).toEqual(["CHALLENGE SOMEONE", "REPLAY", "ALL GAMES"]);
  });
});

describe("Blind Rank engine", () => {
  it("keeps the five weighted V1 lineup roles and ten-percent Bad wildcard target", () => {
    expect(BLIND_RANK_ROLES).toHaveLength(5);
    for (const role of BLIND_RANK_ROLES) {
      const total = Object.values(role.weights).reduce((sum, value) => sum + value, 0);
      expect(total).toBeCloseTo(1, 8);
    }
    expect(BLIND_RANK_ROLES.find((role) => role.id === "wildcard")?.weights.bad).toBe(0.1);
  });

  it("builds deterministic five-fighter lineups with no duplicates and at most one Bad fighter", () => {
    for (const pack of blindRankPacks) {
      const first = createBlindRankLineup(pack.id, `lineup-${pack.id}`);
      const second = createBlindRankLineup(pack.id, `lineup-${pack.id}`);
      expect(first).toEqual(second);
      expect(first.fighters).toHaveLength(5);
      expect(new Set(first.fighters.map((fighter) => fighter.id)).size).toBe(5);
      expect(first.badFighters).toBeLessThanOrEqual(1);
      expect(first.assignments).toHaveLength(5);
    }
  });

  it("protects the recent reveal window and preserves exact shared lineups", () => {
    const first = createBlindRankLineup("ufc-careers", "first-lineup");
    const second = createBlindRankLineup("ufc-careers", "second-lineup", {
      recent: first.fighters.map((fighter) => fighter.id),
      lastLineup: first.fighters.map((fighter) => fighter.id),
    });
    const firstIds = new Set(first.fighters.map((fighter) => fighter.id));
    expect(second.fighters.every((fighter) => !firstIds.has(fighter.id))).toBe(true);

    const shared = resolveBlindRankChallenge("ufc-careers", first.fighters.map((fighter) => fighter.id));
    expect(shared?.map((fighter) => fighter.id)).toEqual(first.fighters.map((fighter) => fighter.id));
  });
});

describe("Blind Rank presentation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("locks one fighter into each chosen slot and finishes after five placements", () => {
    const { container } = renderBlindRank();
    expect(container.querySelectorAll(".blind-rank-slot")).toHaveLength(5);

    for (let placement = 0; placement < 5; placement += 1) {
      const openSlot = container.querySelector<HTMLButtonElement>(".blind-rank-slot:not(.is-filled)");
      expect(openSlot).not.toBeNull();
      fireEvent.click(openSlot!);
      expect(container.querySelectorAll(".blind-rank-slot.is-filled")).toHaveLength(placement + 1);
    }

    expect(container.textContent).toContain("YOUR FINAL RANKING");
    expect(container.querySelectorAll(".blind-rank-results article")).toHaveLength(5);
    const actions = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actions).toEqual(["CHALLENGE SOMEONE", "REPLAY", "ALL GAMES"]);
  });

  it("opens an exact five-fighter friend challenge", () => {
    const lineup = createBlindRankLineup("ufc-careers", "shared-lineup").fighters;
    const query = lineup.map((fighter) => fighter.id).join(",");
    const { container } = renderBlindRank(`/play/blind-rank?pack=ufc-careers&lineup=${query}`);
    expect(container.textContent).toContain("FRIEND CHALLENGE");
    expect(container.textContent).toContain("Same five. Your ranking.");
    expect(container.textContent).toContain(lineup[0].name);
  });
});
