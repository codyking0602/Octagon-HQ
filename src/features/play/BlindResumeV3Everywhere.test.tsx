import { fireEvent, render, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { challengeResultScoreLabel } from "../challenges/ChallengeResultDetails";
import { createPlayChallenge } from "../challenges/challengeModel";
import { IdentityProvider } from "../identity/IdentityProvider";
import IntelligencePage from "../intelligence/IntelligencePage";
import BlindResumePage from "./BlindResumePage";
import { blindResumeWinner } from "./blindResumeEngine";
import {
  blindResumeV3RoundPoints,
  createBlindResumeV3Card,
  storedBlindResumeV3Card,
} from "./blindResumeV3";

function renderBlindResume(path: string) {
  return render(
    <IdentityProvider gateway={null}><ChallengeProvider>
      <MemoryRouter initialEntries={[path]}>
        <BlindResumePage />
      </MemoryRouter>
    </ChallengeProvider></IdentityProvider>,
  );
}

function renderBlindResumeWithIntelligence(path: string) {
  return render(
    <IdentityProvider gateway={null}><ChallengeProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/play/blind-resume" element={<BlindResumePage />} />
          <Route path="/intelligence" element={<IntelligencePage />} />
        </Routes>
      </MemoryRouter>
    </ChallengeProvider></IdentityProvider>,
  );
}

describe("Blind Resume V3 shared contract", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("reuses the Daily V3 card contract for deterministic same-gender matchups and constrained stat order", () => {
    const first = createBlindResumeV3Card("shared-v3-proof");
    const second = createBlindResumeV3Card("shared-v3-proof");

    expect(first).toEqual(second);
    expect(first.revealCounts).toEqual([2, 4, 6, 8]);
    expect(first.roundSet.pairs).toHaveLength(5);
    expect(first.statsByRound).toHaveLength(5);
    expect(first.roundSet.pairs.every((pair) => pair.fighterA.gender === pair.fighterB.gender)).toBe(true);
    expect(first.roundSet.pairs.every((pair) => blindResumeWinner(pair).model.rank === Math.min(pair.fighterA.model.rank, pair.fighterB.model.rank))).toBe(true);

    const redundantOpening = new Set(["UFC title-fight wins", "Top-5 wins"]);
    for (const stats of first.statsByRound) {
      expect(stats).toHaveLength(8);
      expect(redundantOpening.has(stats[0]!.label) && redundantOpening.has(stats[1]!.label)).toBe(false);
    }

    expect(first.revealCounts.map((count) => blindResumeV3RoundPoints(count, true))).toEqual([20, 19, 18, 17]);
    expect(first.revealCounts.map((count) => blindResumeV3RoundPoints(count, false))).toEqual([2, 4, 6, 8]);
  });

  it("round-trips the exact V3 challenge snapshot so profile recipients keep matchup and reveal order", () => {
    const card = createBlindResumeV3Card("profile-snapshot-proof");
    const stored = storedBlindResumeV3Card(JSON.parse(JSON.stringify(card)));
    expect(stored).toEqual(card);
    expect(stored?.roundSet.pairs.map((pair) => pair.id)).toEqual(card.roundSet.pairs.map((pair) => pair.id));
    expect(stored?.statsByRound.map((stats) => stats.map((stat) => stat.label))).toEqual(
      card.statsByRound.map((stats) => stats.map((stat) => stat.label)),
    );
  });

  it("shows V3 score plus record in challenge results while preserving V2 /5 copy", () => {
    const base = {
      code: "BRV3",
      gameId: "blind-resume" as const,
      gameTitle: "Blind Resume",
      summary: "Five matchups",
      creatorId: "sender",
      recipientId: "recipient",
      playUrl: "/play/blind-resume",
      setup: {},
      now: new Date("2026-08-18T00:00:00Z"),
    };
    const v3 = createPlayChallenge({
      ...base,
      gameVersion: "blind-resume-v3",
      creatorResult: { score: 82, record: { wins: 4, losses: 1 } },
    });
    const v2 = createPlayChallenge({
      ...base,
      code: "BRV2",
      gameVersion: "blind-resume-v2",
      creatorResult: { score: 4 },
    });

    expect(challengeResultScoreLabel(v3, v3.creatorResult)).toBe("82/100 · 4-1");
    expect(challengeResultScoreLabel(v2, v2.creatorResult)).toBe("4/5");
  });

  it("shows all eight rows, reveals 2 → 4 → 6 → 8, and scores the lock stage", () => {
    const seed = "casual-stage-proof";
    const card = createBlindResumeV3Card(seed);
    const pair = card.roundSet.pairs[0]!;
    const { container } = renderBlindResume(`/play/blind-resume?challenge=${seed}&v=3`);

    expect(container.querySelector(".blind-resume-page")?.getAttribute("data-version")).toBe("v3");
    expect(container.querySelectorAll(".blind-resume-stats > div")).toHaveLength(8);
    expect([...container.querySelectorAll(".blind-resume-stats strong")].filter((node) => node.textContent === "•••")).toHaveLength(12);
    expect(container.textContent).toContain("2 OF 8 STATS SHOWN · LOCK NOW: CORRECT +20 · MISS +2");

    fireEvent.click(within(container).getByText("REVEAL 2 MORE STATS"));
    expect(container.textContent).toContain("4 OF 8 STATS SHOWN · LOCK NOW: CORRECT +19 · MISS +4");
    fireEvent.click(within(container).getByText("REVEAL 2 MORE STATS"));
    expect(container.textContent).toContain("6 OF 8 STATS SHOWN · LOCK NOW: CORRECT +18 · MISS +6");

    const winner = blindResumeWinner(pair);
    const buttons = container.querySelectorAll<HTMLButtonElement>(".blind-resume-picks button");
    fireEvent.click(buttons[pair.fighterA.id === winner.id ? 0 : 1]!);
    expect(container.textContent).toContain("+18 POINTS");

    fireEvent.click(within(container).getByText("NEXT ROUND"));
    expect(container.textContent).toContain("18 PTS · 1-0");
    expect(container.textContent).toContain("2 OF 8 STATS SHOWN · LOCK NOW: CORRECT +20 · MISS +2");
  });

  it("caps a perfect five-round opening-lock card at 100 while preserving the 5-0 record", () => {
    const seed = "perfect-v3-proof";
    const card = createBlindResumeV3Card(seed);
    const { container } = renderBlindResume(`/play/blind-resume?challenge=${seed}&v=3`);

    for (const pair of card.roundSet.pairs) {
      const winner = blindResumeWinner(pair);
      const buttons = container.querySelectorAll<HTMLButtonElement>(".blind-resume-picks button");
      fireEvent.click(buttons[pair.fighterA.id === winner.id ? 0 : 1]!);
      fireEvent.click(container.querySelector<HTMLButtonElement>(".primary-action")!);
    }

    expect(container.textContent).toContain("100/100");
    expect(container.textContent).toContain("5-0 record · 100 points");
    expect(container.querySelectorAll(".blind-resume-recap__round")).toHaveLength(5);
    expect([...container.querySelectorAll(".blind-resume-recap__round header b")].every((node) => node.textContent === "CORRECT · +20")).toBe(true);
  });

  it("restores the exact scored matchup after taking both fighters to Intelligence", () => {
    const seed = "v3-intelligence-return";
    const card = createBlindResumeV3Card(seed);
    const pair = card.roundSet.pairs[0]!;
    const { container } = renderBlindResumeWithIntelligence(`/play/blind-resume?run=${seed}`);
    const view = within(container);

    fireEvent.click(view.getByText("REVEAL 2 MORE STATS"));
    const winner = blindResumeWinner(pair);
    const buttons = container.querySelectorAll<HTMLButtonElement>(".blind-resume-picks button");
    fireEvent.click(buttons[pair.fighterA.id === winner.id ? 0 : 1]!);
    const verdict = container.querySelector(".blind-resume-verdict h1")?.textContent;
    expect(container.textContent).toContain("+19 POINTS");

    fireEvent.click(view.getByText("TAKE MATCHUP TO INTELLIGENCE"));
    fireEvent.click(view.getByText("← Back to Blind Resume"));

    expect(container.querySelector(".blind-resume-verdict h1")?.textContent).toBe(verdict);
    expect(container.textContent).toContain("+19 POINTS");
  });
});
