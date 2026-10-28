import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OfficialTodayChallengeView } from "./OfficialTodayChallengePage";
import { createKeepCutLineup, keepCutRating } from "./keepCutEngine";
import type { PlayFighter } from "./playFighterPool";
import type { DailyGameType } from "./todaysChallengeAdapters";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

const dailyId = "11111111-1111-4111-8111-111111111111";

function presentedFighter(id: string, name = id) {
  return {
    id,
    name,
    gender: "men",
    divisions: ["Lightweight"],
    main_era: "Modern",
    thumb_url: `/fighters/${id}.png`,
    profile_url: `/fighters/${id}-profile.png`,
  };
}

function presentedCanonicalFighter(fighter: PlayFighter) {
  return {
    id: fighter.id,
    name: fighter.name,
    gender: fighter.gender,
    divisions: fighter.divisions,
    main_era: fighter.mainEra,
    thumb_url: fighter.thumbUrl,
    profile_url: fighter.profileUrl,
  };
}

function projection(
  gameType: DailyGameType,
  publicSetup: Record<string, unknown>,
  publicState: Record<string, unknown>,
  overrides: Partial<TodayChallengeProjection> = {},
): TodayChallengeProjection {
  return {
    available: true,
    id: dailyId,
    centralDay: "2026-08-05",
    scheduleVersion: "find-leader-v1",
    gameType,
    setupKey: `${gameType}:test`,
    contentVersion: `${gameType}-v1`,
    scoringVersion: "play-official-score-v1",
    fallbackReason: null,
    publicSetup,
    progressRevision: 1,
    publicState,
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
    ...overrides,
  };
}

function renderView(value: TodayChallengeProjection) {
  const onAdvance = vi.fn();
  const onNavigate = vi.fn();
  const rendered = render(
    <OfficialTodayChallengeView
      projection={value}
      busy={false}
      onAdvance={onAdvance}
      onNavigate={onNavigate}
    />,
  );
  return { onAdvance, onNavigate, ...rendered };
}

describe("official Today’s Challenge uses the canonical casual game presentation", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
  });

  it("plays Find the Leader through the casual board contract without shipping the hidden leader value", () => {
    const candidates = Array.from({ length: 10 }, (_, index) => ({
      id: `fighter-${index + 1}`,
      name: `Fighter ${index + 1}`,
      division: "Lightweight",
      thumb_url: `/fighters/fighter-${index + 1}.png`,
    }));
    const { onAdvance, container } = renderView(projection(
      "find_leader",
      { question: "Who has the most UFC wins?", context: "Leave the group leader standing.", stat_label: "UFC WINS", candidates },
      { complete: false, eliminated_ids: [], native_progress: 0 },
    ));

    expect(container.querySelector(".find-game__hero")).not.toBeNull();
    expect(container.querySelectorAll(".find-card")).toHaveLength(10);
    expect(screen.getAllByText("ELIMINATE")).toHaveLength(10);
    expect(screen.queryByText("HIDDEN LEADER VALUE")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Fighter 1").closest("button")!);
    expect(onAdvance).toHaveBeenCalledWith({ eliminated_id: "fighter-1" });
  });

  it("plays Wavelength through the casual clue and guess panel", () => {
    const { onAdvance, container } = renderView(projection(
      "wavelength",
      { clue_count: 4 },
      {
        complete: false,
        guesses: [50],
        clues: [{ id: "clue-1", category: "STYLE", text: "Pressure-heavy striker" }],
        next_guess_number: 2,
      },
    ));

    expect(container.querySelector(".wavelength-clue")).not.toBeNull();
    expect(container.querySelector(".wavelength-guess-panel")).not.toBeNull();
    expect(screen.getByText("Pressure-heavy striker")).toBeInTheDocument();
    const slider = screen.getByLabelText("Your Wavelength guess from 1 to 100");
    fireEvent.change(slider, { target: { value: "63" } });
    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
    expect(onAdvance).toHaveBeenCalledWith({ guess: 63 });
  });

  it("plays Blind Resume through the exact casual scoreboard and resume-card hierarchy", () => {
    const { onAdvance, container } = renderView(projection(
      "blind_resume",
      { round_count: 5 },
      {
        complete: false,
        round_index: 0,
        results: [],
        current_round: {
          round_number: 1,
          stats: [
            { label: "UFC TITLE-FIGHT WINS", value_a: "1", value_b: "2" },
            { label: "TOP-5 WINS", value_a: "4", value_b: "3" },
            { label: "APEX RATING", value_a: "94", value_b: "93" },
          ],
        },
      },
    ));

    expect(container.querySelector(".blind-resume-scoreboard")).not.toBeNull();
    expect(container.querySelector(".blind-resume-card")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Which UFC career ranks higher?" })).toBeInTheDocument();
    expect(screen.queryByText("LAST PICK")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "PICK A" }));
    expect(onAdvance).toHaveBeenCalledWith({ choice: "A" });
  });

  it("stops on the casual Blind Resume verdict after a daily pick before showing the next round", () => {
    const base = projection(
      "blind_resume",
      { round_count: 5 },
      {
        complete: false,
        round_index: 0,
        results: [],
        current_round: { round_number: 1, stats: [{ label: "APEX RATING", value_a: "94", value_b: "93" }] },
      },
    );
    const { rerender, container } = renderView(base);
    rerender(
      <OfficialTodayChallengeView
        projection={{
          ...base,
          progressRevision: 2,
          publicState: {
            complete: false,
            round_index: 1,
            results: [{
              round_index: 0,
              picked_id: "fighter-a",
              winner_id: "fighter-a",
              correct: true,
              fighter_a: presentedFighter("fighter-a", "Fighter A Name"),
              fighter_b: presentedFighter("fighter-b", "Fighter B Name"),
            }],
            current_round: { round_number: 2, stats: [{ label: "APEX RATING", value_a: "90", value_b: "91" }] },
          },
        }}
        busy={false}
        onAdvance={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(container.querySelector(".blind-resume-verdict")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Fighter A Name ranks higher" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEXT ROUND" })).toBeInTheDocument();
    expect(container.querySelector(".blind-resume-card")).toBeNull();
  });

  it("plays Blind Rank 5 through the casual locked-slot board", () => {
    const { onAdvance, container } = renderView(projection(
      "blind_rank_5",
      { pack: { name: "UFC Careers", prompt: "Rank these careers", intro: "Every slot locks." } },
      {
        complete: false,
        reveal_index: 1,
        slots: [presentedFighter("locked", "Locked Fighter"), null, null, null, null],
        current_fighter: presentedFighter("current", "Current Fighter"),
      },
    ));

    expect(container.querySelector(".blind-rank-game")).not.toBeNull();
    expect(container.querySelector(".blind-rank-current")).not.toBeNull();
    expect(screen.getByText("Current Fighter")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /PLACE HERE/ })[0]!);
    expect(onAdvance).toHaveBeenCalledWith({ slot: 2 });
  });

  it("plays Keep 4, Cut 4 through the casual trays and decision card", () => {
    const kept = ["one", "two", "three", "four"].map((id) => presentedFighter(id, `Kept ${id}`));
    const cut = ["five", "six"].map((id) => presentedFighter(id, `Cut ${id}`));
    const { onAdvance, container } = renderView(projection(
      "keep_4_cut_4",
      { pack: { group: "Careers", name: "UFC Careers", prompt: "Build the best four", description: "Eight blind reveals." } },
      {
        complete: false,
        reveal_index: 6,
        kept,
        cut,
        current_fighter: presentedFighter("seven", "Current Fighter"),
        forced_choice: "cut",
      },
    ));

    expect(container.querySelector(".keep-cut-game-card")).not.toBeNull();
    expect(container.querySelectorAll(".keep-cut-tray")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "KEEP" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "CUT" })).toBeEnabled();
    expect(screen.getByText("KEEP IS FULL — THIS FIGHTER MUST BE CUT")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CUT" }));
    expect(onAdvance).toHaveBeenCalledWith({ choice: "cut" });
  });

  it("shows a perfect Keep 4, Cut 4 in the aligned official result presentation", () => {
    const board = createKeepCutLineup("ufc-careers", "official-page-perfect").fighters;
    const ranked = [...board].sort((left, right) => {
      const ratingDifference = keepCutRating("ufc-careers", right) - keepCutRating("ufc-careers", left);
      return ratingDifference || left.id.localeCompare(right.id);
    });
    const kept = ranked.slice(0, 4).map(presentedCanonicalFighter);
    const cut = ranked.slice(4).map(presentedCanonicalFighter);
    const { container } = renderView(projection(
      "keep_4_cut_4",
      { pack: { id: "ufc-careers", group: "Careers", name: "UFC Careers", prompt: "Build the best four", description: "Eight blind reveals." } },
      { complete: true, reveal_index: 8, kept, cut, current_fighter: null, reveal: { model_top_four_ids: kept.map((row) => row.id) } },
      {
        revealSetup: { fighters: [...kept, ...cut], model_top_four_ids: kept.map((row) => row.id) },
        officialAttempt: {
          nativeScore: 16,
          normalizedScore: 100,
          completedAt: "2026-08-05T03:00:00Z",
          publicResult: { kept_ids: kept.map((row) => row.id), correct_comparisons: 16 },
        },
      },
    ));

    expect(container.querySelector(".keep-cut-result-hero")).not.toBeNull();
    expect(screen.getByRole("heading", { name: /100\/100 · OFFICIAL RESULT/ })).toBeInTheDocument();
    expect(screen.getByText("4 OF OCTAGON HQ’S TOP 4 KEPT")).toBeInTheDocument();
    expect(screen.getByText("OCTAGON HQ TOP 4")).toBeInTheDocument();
    expect(screen.getByText("PERFECT READ")).toBeInTheDocument();
    expect(screen.getByText("YOUR BOARD")).toBeInTheDocument();
    expect(container.querySelectorAll(".keep-cut-result-fighter")).toHaveLength(8);
    expect(container.textContent).not.toMatch(/OF 16 COMPARISONS/i);
    expect(container.textContent).not.toMatch(/COMPARISONS WON/i);
    expect(screen.queryByRole("button", { name: "KEEP" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CUT" })).not.toBeInTheDocument();
  });
});