import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OfficialTodayChallengeView } from "./OfficialTodayChallengePage";
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
  render(
    <OfficialTodayChallengeView
      projection={value}
      busy={false}
      onAdvance={onAdvance}
      onNavigate={onNavigate}
    />,
  );
  return { onAdvance, onNavigate };
}

describe("official Today’s Challenge at the 390×844 phone contract", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
  });

  it("plays Find the Leader without shipping the hidden leader value", () => {
    const candidates = Array.from({ length: 10 }, (_, index) => ({
      id: `fighter-${index + 1}`,
      name: `Fighter ${index + 1}`,
      division: "Lightweight",
      thumb_url: `/fighters/fighter-${index + 1}.png`,
    }));
    const { onAdvance } = renderView(projection(
      "find_leader",
      { question: "Who has the most UFC wins?", stat_label: "UFC WINS", candidates },
      { complete: false, eliminated_ids: [], native_progress: 0 },
    ));

    expect(screen.getByTestId("official-daily-page")).toHaveAttribute("data-testid", "official-daily-page");
    expect(screen.getAllByText("ELIMINATE")).toHaveLength(10);
    expect(screen.queryByText("HIDDEN LEADER VALUE")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Fighter 1").closest("button")!);
    expect(onAdvance).toHaveBeenCalledWith({ eliminated_id: "fighter-1" });
  });

  it("plays Wavelength with only the clues already earned", () => {
    const { onAdvance } = renderView(projection(
      "wavelength",
      { clue_count: 4 },
      {
        complete: false,
        guesses: [50],
        clues: [{ id: "clue-1", category: "STYLE", text: "Pressure-heavy striker" }],
        next_guess_number: 2,
      },
    ));

    expect(screen.getByText("Pressure-heavy striker")).toBeInTheDocument();
    expect(screen.queryByText("Secret target: 77")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Exact Wavelength guess"), { target: { value: "63" } });
    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS 2" }));
    expect(onAdvance).toHaveBeenCalledWith({ guess: 63 });
  });

  it("plays Blind Resume with identities hidden until each pick", () => {
    const { onAdvance } = renderView(projection(
      "blind_resume",
      { round_count: 5 },
      {
        complete: false,
        round_index: 0,
        results: [],
        current_round: {
          round_number: 1,
          stats: [
            { label: "UFC WINS", value_a: "14", value_b: "12" },
            { label: "TITLE WINS", value_a: "2", value_b: "4" },
          ],
        },
      },
    ));

    expect(screen.getByText("NO NAMES")).toBeInTheDocument();
    expect(screen.queryByText("Future Fighter")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "PICK FIGHTER A" }));
    expect(onAdvance).toHaveBeenCalledWith({ choice: "A" });
  });

  it("plays Blind Rank 5 one fighter at a time with locked slots", () => {
    const { onAdvance } = renderView(projection(
      "blind_rank_5",
      { pack: { name: "UFC Careers", prompt: "Rank these careers", intro: "Every slot locks." } },
      {
        complete: false,
        reveal_index: 1,
        slots: [presentedFighter("locked", "Locked Fighter"), null, null, null, null],
        current_fighter: presentedFighter("current", "Current Fighter"),
      },
    ));

    expect(screen.getByText("Current Fighter")).toBeInTheDocument();
    expect(screen.queryByText("Future Fighter")).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /PLACE HERE/ })[0]!);
    expect(onAdvance).toHaveBeenCalledWith({ slot: 2 });
  });

  it("preserves the corrected forced Keep 4, Cut 4 flow", () => {
    const kept = ["one", "two", "three", "four"].map((id) => presentedFighter(id, `Kept ${id}`));
    const cut = ["five", "six"].map((id) => presentedFighter(id, `Cut ${id}`));
    const { onAdvance } = renderView(projection(
      "keep_4_cut_4",
      { pack: { prompt: "Build the best four", description: "Eight blind reveals." } },
      {
        complete: false,
        reveal_index: 6,
        kept,
        cut,
        current_fighter: presentedFighter("seven", "Current Fighter"),
        forced_choice: "cut",
      },
    ));

    expect(screen.getByText("Current Fighter")).toBeInTheDocument();
    expect(screen.queryByText("Eighth Fighter")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "KEEP" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "CUT" })).toBeEnabled();
    expect(screen.getByText("KEEP IS FULL — THIS FIGHTER MUST BE CUT")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CUT" }));
    expect(onAdvance).toHaveBeenCalledWith({ choice: "cut" });
  });

  it("shows a perfect Keep 4, Cut 4 as 16 board-relative comparisons and 100", () => {
    const kept = ["one", "two", "three", "four"].map((id) => presentedFighter(id, `Kept ${id}`));
    const cut = ["five", "six", "seven", "eight"].map((id) => presentedFighter(id, `Cut ${id}`));
    renderView(projection(
      "keep_4_cut_4",
      { pack: { prompt: "Build the best four", description: "Eight blind reveals." } },
      { complete: true, reveal_index: 8, kept, cut, current_fighter: null, reveal: { model_top_four_ids: kept.map((row) => row.id) } },
      {
        revealSetup: { model_top_four_ids: kept.map((row) => row.id) },
        officialAttempt: {
          nativeScore: 16,
          normalizedScore: 100,
          completedAt: "2026-08-05T03:00:00Z",
          publicResult: { kept_ids: kept.map((row) => row.id), correct_comparisons: 16 },
        },
      },
    ));

    expect(screen.getByRole("heading", { name: "100/100" })).toBeInTheDocument();
    expect(screen.getByText("4 of the board’s actual top four kept · 16 of 16 comparisons won.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "KEEP" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CUT" })).not.toBeInTheDocument();
  });
});
