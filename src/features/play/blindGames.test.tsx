import { fireEvent, render, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import IntelligencePage from "../intelligence/IntelligencePage";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
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
import { selectReplayLineup } from "./lineupModel";
import { blindRankPool, getPlayFighter, rankedPlayFighters } from "./playFighterPool";

function renderBlindResume(path = "/play/blind-resume") {
  return render(
    <IdentityProvider gateway={null}><ChallengeProvider>
      <MemoryRouter initialEntries={[path]}>
        <BlindResumePage />
      </MemoryRouter>
    </ChallengeProvider></IdentityProvider>,
  );
}

function renderBlindResumeWithIntelligence(path = "/play/blind-resume") {
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

function renderBlindRank(path = "/play/blind-rank") {
  return render(
    <IdentityProvider gateway={null}><ChallengeProvider>
      <MemoryRouter initialEntries={[path]}>
        <BlindRankPage />
      </MemoryRouter>
    </ChallengeProvider></IdentityProvider>,
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

  it("uses the eight approved hidden resume stats including main UFC era", () => {
    const pair = createBlindResumeRounds("stat-proof").pairs[0];
    expect(blindResumeStats(pair).map((stat) => stat.label)).toEqual([
      "UFC title-fight wins",
      "Top-5 wins",
      "Prime UFC record",
      "Main UFC era",
      "Apex rating",
      "Rounds won",
      "Finish rate",
      "Active elite years",
    ]);
    const winner = blindResumeWinner(pair);
    expect(winner.model.rank).toBe(Math.min(pair.fighterA.model.rank, pair.fighterB.model.rank));
  });

  it("uses the exact canonical ranking era name for every ranked Play fighter", () => {
    const eraNameById = new Map(
      canonicalRankingInputs.filters.eras.map((era) => [era.id, era.name]),
    );

    for (const fighter of rankedPlayFighters) {
      const membership = canonicalRankingInputs.filters.eraMembership[fighter.name];
      expect(membership).toBeDefined();
      expect(fighter.mainEra).toBe(eraNameById.get(membership!.primary));
    }
  });

  it("keeps distinct profile and thumbnail assets for varied portrait crops", () => {
    for (const slug of ["rose-namajunas", "joanna-jedrzejczyk", "robbie-lawler", "rashad-evans"]) {
      const fighter = getPlayFighter(slug);
      expect(fighter?.profileUrl).toBe(`/assets/fighters/${slug}.webp`);
      expect(fighter?.thumbUrl).toBe(`/assets/fighters/${slug}-thumb.webp`);
    }
  });
});

describe("Blind Resume presentation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("reveals the fighters, verdict, and Intelligence handoff after a pick", () => {
    const seed = "render-proof";
    const pair = createBlindResumeRounds(seed).pairs[0];
    const { container } = renderBlindResume(`/play/blind-resume?challenge=${seed}`);
    expect(container.querySelectorAll(".blind-resume-stats > div")).toHaveLength(8);
    fireEvent.click(container.querySelector<HTMLButtonElement>(".blind-resume-picks button")!);
    expect(container.querySelectorAll(".blind-resume-reveal-grid article")).toHaveLength(2);
    expect([...container.querySelectorAll<HTMLImageElement>(".blind-resume-reveal-photo")].map((photo) => photo.getAttribute("src"))).toEqual([
      pair.fighterA.profileUrl || pair.fighterA.thumbUrl,
      pair.fighterB.profileUrl || pair.fighterB.thumbUrl,
    ]);
    expect(container.textContent).toContain(pair.fighterA.name);
    expect(container.textContent).toContain(pair.fighterB.name);
    expect(container.textContent).toContain("TAKE MATCHUP TO INTELLIGENCE");
    expect(container.textContent).toMatch(/NEXT ROUND|SEE FINAL SCORE/);
  });

  it("returns from Intelligence to the unchanged revealed matchup", () => {
    const { container } = renderBlindResumeWithIntelligence("/play/blind-resume?run=return-proof");
    const view = within(container);
    fireEvent.click(container.querySelector<HTMLButtonElement>(".blind-resume-picks button")!);
    const verdict = container.querySelector(".blind-resume-verdict h1")?.textContent;
    fireEvent.click(view.getByText("TAKE MATCHUP TO INTELLIGENCE"));
    fireEvent.click(view.getByText("← Back to Blind Resume"));
    expect(container.querySelector(".blind-resume-verdict h1")?.textContent).toBe(verdict);
  });

  it("finishes a curated card after five picks and labels replay honestly", () => {
    const seed = "five-round-proof";
    const roundSet = createBlindResumeRounds(seed);
    const { container } = renderBlindResume(`/play/blind-resume?challenge=${seed}`);
    for (let round = 0; round < BLIND_RESUME_ROUNDS; round += 1) {
      fireEvent.click(container.querySelector<HTMLButtonElement>(".blind-resume-picks button")!);
      fireEvent.click(container.querySelector<HTMLButtonElement>(".primary-action")!);
    }
    expect(container.textContent).toContain("FIVE-ROUND RESULTS");
    expect(container.querySelectorAll(".blind-resume-recap__round")).toHaveLength(5);
    expect(container.querySelectorAll("canvas.blind-resume-recap__photo")).toHaveLength(10);
    const actions = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actions).toEqual(["CHALLENGE SOMEONE", "REPLAY CHALLENGE", "ALL GAMES"]);
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

  it("delegates repeat protection to the shared owner and preserves exact shared lineups", () => {
    window.localStorage.clear();
    const validIds = new Set(blindRankPool("ufc-careers").map((fighter) => fighter.id));
    const select = () => selectReplayLineup({
      gameId: "blind-rank-proof",
      lineupSize: 5,
      attempts: 10,
      validItemIds: validIds,
      build: (seed) => {
        const lineup = createBlindRankLineup("ufc-careers", seed).fighters;
        const ids = lineup.map((fighter) => fighter.id);
        return { value: lineup, itemIds: ids, fighterIds: ids };
      },
    });
    const first = select();
    const second = select();
    expect(second.itemIds).not.toEqual(first.itemIds);

    const shared = resolveBlindRankChallenge("ufc-careers", first.itemIds);
    expect(shared?.map((fighter) => fighter.id)).toEqual(first.itemIds);
  });
});

describe("Blind Rank presentation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("uses the thumbnail, locks five placements, then starts a new casual lineup", () => {
    const { container } = renderBlindRank();
    const currentPhoto = container.querySelector<HTMLCanvasElement>(".blind-rank-current__photo");
    expect(currentPhoto?.tagName).toBe("CANVAS");
    expect(container.querySelectorAll(".blind-rank-slot")).toHaveLength(5);

    for (let placement = 0; placement < 4; placement += 1) {
      const openSlot = container.querySelector<HTMLButtonElement>(".blind-rank-slot:not(.is-filled)");
      fireEvent.click(openSlot!);
      expect(container.querySelectorAll(".blind-rank-slot.is-filled")).toHaveLength(placement + 1);
    }
    fireEvent.click(container.querySelector<HTMLButtonElement>(".blind-rank-slot:not(.is-filled)")!);

    expect(container.textContent).toContain("YOUR FINAL RANKING");
    expect(container.querySelectorAll(".blind-rank-slot")).toHaveLength(0);
    expect(container.querySelectorAll(".blind-rank-results article")).toHaveLength(5);
    const actions = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actions).toEqual(["CHALLENGE SOMEONE", "PLAY AGAIN", "ALL GAMES"]);
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
