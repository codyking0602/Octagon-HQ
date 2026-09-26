import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import MlbBlindResumeOwnerRun, { MLB_BLIND_RESUME_OWNER_ROUNDS } from "./MlbBlindResumeOwnerRun";

afterEach(() => cleanup());

function renderRun() {
  return render(
    <MemoryRouter>
      <MlbBlindResumeOwnerRun />
    </MemoryRouter>,
  );
}

function pickWinner(roundIndex: number) {
  const round = MLB_BLIND_RESUME_OWNER_ROUNDS[roundIndex]!;
  const side = round.winnerId === round.playerA.id ? "A" : "B";
  fireEvent.click(screen.getByRole("button", { name: `PICK ${side}` }));
}

describe("MLB Blind Resume owner run", () => {
  it("uses five burned matchups and disposable owner-only identities", () => {
    expect(MLB_BLIND_RESUME_OWNER_ROUNDS).toHaveLength(5);
    const identities = MLB_BLIND_RESUME_OWNER_ROUNDS.flatMap((round) => [round.playerA, round.playerB]);
    expect(new Set(identities.map((row) => row.id)).size).toBe(10);
    expect(identities.every((row) => row.id.startsWith("mlb-owner-blind-resume-"))).toBe(true);
    expect(MLB_BLIND_RESUME_OWNER_ROUNDS.every((round) => round.stats.length === 8)).toBe(true);
  });

  it("renders as a real five-round MLB challenge with green sport identity and no review language", () => {
    const { container } = renderRun();
    expect(container.querySelector('.blind-resume-page[data-sport="mlb"]')).toBeTruthy();
    expect(container.textContent).toContain("MLB PLAYOFF CHALLENGE");
    expect(container.textContent).toContain("Which MLB career ranks higher?");
    expect(container.textContent).toContain("ROUND 1 OF 5");
    expect(container.textContent).not.toMatch(/preview|demo|test|owner review|prototype|disposable/i);
  });

  it("uses the canonical V3 reveal ladder and aggregates five rounds to one 100-point score", () => {
    renderRun();

    pickWinner(0);
    fireEvent.click(screen.getByRole("button", { name: /next round/i }));

    fireEvent.click(screen.getByRole("button", { name: /reveal 2 more stats/i }));
    pickWinner(1);
    fireEvent.click(screen.getByRole("button", { name: /next round/i }));

    fireEvent.click(screen.getByRole("button", { name: /reveal 2 more stats/i }));
    fireEvent.click(screen.getByRole("button", { name: /reveal 2 more stats/i }));
    pickWinner(2);
    fireEvent.click(screen.getByRole("button", { name: /next round/i }));

    fireEvent.click(screen.getByRole("button", { name: /reveal 2 more stats/i }));
    fireEvent.click(screen.getByRole("button", { name: /reveal 2 more stats/i }));
    fireEvent.click(screen.getByRole("button", { name: /reveal 2 more stats/i }));
    pickWinner(3);
    fireEvent.click(screen.getByRole("button", { name: /next round/i }));

    pickWinner(4);
    fireEvent.click(screen.getByRole("button", { name: /see final score/i }));

    expect(screen.getByText("94/100")).toBeInTheDocument();
    expect(screen.getByText("Perfect picks")).toBeInTheDocument();
    expect(screen.queryByText("Perfect card")).not.toBeInTheDocument();
    expect(screen.getByText(/5-0 record · 94 points earned/)).toBeInTheDocument();
  });

  it("stays behind the existing owner capability while the approved Oct. 9 slot is production-ready", () => {
    const page = readFileSync("src/features/mlb/MlbFeaturedChallengePage.tsx", "utf8");
    const schedule = readFileSync("src/features/mlb/mlbChallengeSchedule.ts", "utf8");
    const styles = readFileSync("src/styles/blind-resume-alignment.css", "utf8");

    expect(page).toContain("identity.profile?.canControlPicks === true");
    expect(page).toContain("return <MlbBlindResumeOwnerRun />");
    expect(schedule).toMatch(/date: "2026-10-09",[\s\S]*?game_type: "blind_resume",[\s\S]*?ready: true/);
    expect(styles).toContain('.blind-resume-page[data-sport="mlb"]');
    expect(styles).toContain("--mlb-blind-accent: #2f855f");
    expect(styles).toContain("grid-template-columns: 42px minmax(0, 1fr) auto");
    expect(styles).toContain("grid-template-columns: minmax(142px, .8fr) minmax(0, 1.2fr)");
  });
});
