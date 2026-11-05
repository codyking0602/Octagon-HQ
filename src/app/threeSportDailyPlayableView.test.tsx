import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OfficialTodayChallengeContent } from "../features/play/OfficialTodayChallengePage";
import { NbaOfficialDailyContent } from "../features/nba/NbaOfficialDailyPage";
import type { TodayChallengeProjection } from "../features/play/todayChallengeRepository";

const initialQuestion = {
  id: "official-comparison-1", metricLabel: "Career wins",
  category: "career", league: "UFC",
  known: { name: "Jon Jones", context: "UFC", value: 20, formattedValue: "20", subjectId: "jon-jones" },
  hidden: { name: "Daniel Cormier", context: "UFC", subjectId: "daniel-cormier" },
};
function projection(sport: "ufc" | "nba", roundIndex = 0): TodayChallengeProjection {
  const q = sport === "nba"
    ? { ...initialQuestion, league: "NBA",
      known: { ...initialQuestion.known, name: "Tim Duncan" },
      hidden: { ...initialQuestion.hidden, name: "Shaquille O'Neal" } }
    : initialQuestion;
  const round = { index: 0, correct_count: 0, complete: false, answers: [],
    current_question: q, last_result: null };
  return {
    available: true, sport, id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-11-05", scheduleVersion: "test",
    gameType: "higher_lower", setupKey: "playable:two-game",
    contentVersion: "higher-lower-v1", scoringVersion: "daily-two-game-average-score-v1",
    fallbackReason: null, progressRevision: 0, deploymentSha: "test-sha",
    publicSetup: { format_version: "daily-two-game-average-v1",
      rounds: [{ initial_state: round }, { initial_state: round }] },
    publicState: { format_version: "daily-two-game-average-v1",
      round_index: roundIndex, round_count: 2, active_round: round,
      round_scores: roundIndex ? [80] : [], awaiting_next: false,
      handoff_pending: false, complete: false, score: null },
    revealSetup: null, officialAttempt: null,
  };
}
afterEach(cleanup);
describe("published UFC and NBA Daily boards render an actual first playable question", () => {
  it("UFC: renders the two-game active child with real choice buttons, not just a progress label", () => {
    const advance = vi.fn();
    const value = projection("ufc");
    const { container } = render(<OfficialTodayChallengeContent
      projection={value} busy={false} onAdvance={advance} onNavigate={vi.fn()}
    />);
    expect(screen.getByText("GAME 1 OF 2")).toBeInTheDocument();
    expect(container.querySelector(".ufc-higher-lower")).not.toBeNull();
    expect(screen.getByText("Jon Jones")).toBeInTheDocument();
    expect(screen.getByText("Daniel Cormier")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "HIGHER" }));
    expect(advance).toHaveBeenCalledWith({ choice: "higher" });
  });
  it("NBA: renders game two from the stored active child and exposes both answer buttons", () => {
    const advance = vi.fn();
    const { container } = render(<NbaOfficialDailyContent
      projection={projection("nba", 1)}
      busy={false} advance={advance} onExit={vi.fn()}
    />);
    expect(screen.getByText("GAME 2 OF 2")).toBeInTheDocument();
    expect(container.querySelector(".nba-official-higher-lower")).not.toBeNull();
    expect(screen.getByText("Tim Duncan")).toBeInTheDocument();
    expect(screen.getByText("Shaquille O'Neal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /HIGHER/ }));
    expect(advance).toHaveBeenCalledWith({ choice: "higher" });
  });
});
