import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  advanceFamilyFeudDailyRuntime,
  buildFamilyFeudDailySetup,
} from "../play/familyFeudDailyRuntime";
import MlbSportsFeudOwnerRun, {
  MLB_SPORTS_FEUD_OWNER_PACK,
} from "./MlbSportsFeudOwnerRun";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("family-feud-prototype-active");
  document.body.classList.remove("family-feud-prototype-active");
});

function entityName(entityId: string) {
  const entity = MLB_SPORTS_FEUD_OWNER_PACK.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Missing owner Sports Feud entity ${entityId}`);
  return entity.displayName;
}

describe("MLB Sports Feud owner run", () => {
  it("uses a disposable two-board plus five-question MLB pack", () => {
    expect(MLB_SPORTS_FEUD_OWNER_PACK.id).toMatch(/^mlb-owner-sports-feud-/);
    expect(MLB_SPORTS_FEUD_OWNER_PACK.sport).toBe("mlb");
    expect(MLB_SPORTS_FEUD_OWNER_PACK.mainBoards).toHaveLength(2);
    expect(MLB_SPORTS_FEUD_OWNER_PACK.fastMoney).toHaveLength(5);
    expect(MLB_SPORTS_FEUD_OWNER_PACK.entities.every((entity) => entity.id.startsWith("mlb-owner-feud-"))).toBe(true);
    expect([
      ...MLB_SPORTS_FEUD_OWNER_PACK.mainBoards,
      ...MLB_SPORTS_FEUD_OWNER_PACK.fastMoney,
    ].every((question) => question.id.startsWith("mlb-owner-feud-"))).toBe(true);
  });

  it("renders like a real MLB playoff challenge and uses the uploaded MLB host", () => {
    render(
      <MemoryRouter>
        <MlbSportsFeudOwnerRun />
      </MemoryRouter>,
    );

    expect(screen.getByText("MLB HQ · PLAYOFF CHALLENGE")).toBeInTheDocument();
    expect(screen.getByText("Clear the board.")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/preview|demo|test|owner review|prototype|disposable/i);

    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));

    expect(document.querySelector('.family-feud-prototype[data-scope="mlb"]')).toBeInTheDocument();
    expect(document.querySelector('img[src="/assets/MLB.webp"]')).toBeInTheDocument();
    expect(screen.getByText("WE ASKED MLB HQ")).toBeInTheDocument();
  });

  it("runs the canonical engine end to end and can produce a 100-point card", () => {
    const publication = buildFamilyFeudDailySetup(
      MLB_SPORTS_FEUD_OWNER_PACK,
      "2026-10-12",
      "mlb-sports-feud-owner-run-v1",
    );
    expect(publication.publicSetup.presentation_domain).toBe("mlb");

    let submissionState: Record<string, unknown> = {};
    let finalSubmission: Record<string, unknown> | null = null;

    const advance = (action: Record<string, unknown>) => {
      const next = advanceFamilyFeudDailyRuntime({
        setupKey: publication.setupKey,
        publicSetup: publication.publicSetup,
        privateSetupEvidence: publication.privateSetupEvidence,
        submissionState,
      }, action);
      submissionState = next.submissionState;
      finalSubmission = next.finalSubmission;
      return next;
    };

    MLB_SPORTS_FEUD_OWNER_PACK.mainBoards.forEach((board) => {
      board.answers.slice(0, 4).forEach((answer) => {
        advance({ type: "answer", answer: entityName(answer.entityId) });
      });
    });

    MLB_SPORTS_FEUD_OWNER_PACK.fastMoney.forEach((question, index) => {
      const answer = question.answers[0]!;
      advance({
        type: "answer",
        answer: entityName(answer.entityId),
        question_id: question.id,
        question_index: index,
        time_remaining_ms: 50_000 - index * 1_000,
      });
    });

    expect(finalSubmission).toMatchObject({
      native_score: 100,
      normalized_score: 100,
      main_points: 60,
      fast_money_points: 40,
    });
  });

  it("keeps the approved October 12 production slot separate from the burned owner pack", () => {
    const schedule = readFileSync("src/features/mlb/mlbChallengeSchedule.ts", "utf8");

    expect(schedule).toMatch(/date: "2026-10-12",[\s\S]*?game_type: "sports_feud",[\s\S]*?ready: true/);
    expect(schedule).not.toContain("mlb-sports-feud-owner-run-v1");
  });
});
