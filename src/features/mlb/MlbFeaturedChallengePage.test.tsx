import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import MlbFeaturedChallengePage, {
  MLB_FIND_LEADER_DEMO_BURNED_CONTENT,
  MLB_FIND_LEADER_DEMO_CANDIDATES,
  MLB_FIND_LEADER_DEMO_QUESTION_ID,
} from "./MlbFeaturedChallengePage";
import { mlbTeamAssetByAbbreviation } from "./mlbTeamAssets";

function renderPage() {
  return render(
    <MemoryRouter>
      <MlbFeaturedChallengePage />
    </MemoryRouter>,
  );
}

describe("MLB Find the Leader owner demo", () => {
  it("locks all demo content as burned and keeps a ten-player MLB board", () => {
    expect(MLB_FIND_LEADER_DEMO_QUESTION_ID).toContain("demo");
    expect(MLB_FIND_LEADER_DEMO_CANDIDATES).toHaveLength(10);
    expect(new Set(MLB_FIND_LEADER_DEMO_CANDIDATES.map((candidate) => candidate.id)).size).toBe(10);
    expect(MLB_FIND_LEADER_DEMO_BURNED_CONTENT.candidateIds).toEqual(
      MLB_FIND_LEADER_DEMO_CANDIDATES.map((candidate) => candidate.id),
    );
    expect(MLB_FIND_LEADER_DEMO_BURNED_CONTENT.questionIds).toEqual([MLB_FIND_LEADER_DEMO_QUESTION_ID]);
    expect(MLB_FIND_LEADER_DEMO_CANDIDATES.every((candidate) => (
      Boolean(mlbTeamAssetByAbbreviation(candidate.teamAbbreviation))
    ))).toBe(true);
  });

  it("reuses the locked Football Find the Leader presentation structure", () => {
    const { container } = renderPage();

    expect(container.querySelector(".football-find-hero")).toBeTruthy();
    expect(container.querySelector(".football-find-hero__status")).toBeTruthy();
    expect(container.querySelector(".football-find-grid")).toBeTruthy();
    expect(container.querySelectorAll(".football-find-card")).toHaveLength(10);
    expect(container.querySelector(".mlb-find-leader-page")).toBeTruthy();
  });

  it("reveals safe values and ends the run when the demo leader is eliminated", () => {
    const { container } = renderPage();
    const sorted = [...MLB_FIND_LEADER_DEMO_CANDIDATES]
      .sort((left, right) => (left.value ?? 0) - (right.value ?? 0));
    const safe = sorted[0]!;
    const leader = sorted.at(-1)!;

    const buttonFor = (name: string) => [...container.querySelectorAll<HTMLButtonElement>(".football-find-card")]
      .find((button) => button.textContent?.includes(name));

    fireEvent.click(buttonFor(safe.name)!);
    expect(buttonFor(safe.name)?.textContent).toContain(`SAFE · ${safe.value} 2B`);

    fireEvent.click(buttonFor(leader.name)!);
    expect(container.querySelector(".football-find-result")?.textContent).toContain("RUN ENDED");
    expect(container.querySelector(".football-find-order")).toBeTruthy();
    expect(container.querySelector(".football-find-reveal")).toBeTruthy();
  });
});
