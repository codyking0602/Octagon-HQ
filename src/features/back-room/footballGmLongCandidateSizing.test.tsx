// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { LongCandidateBoard } from "./FootballGmLongDraftPresentation";
import { nflGmLongTeamCandidates } from "./footballGmLongCatalog";
import { FOOTBALL_GM_CAP, FOOTBALL_GM_ROSTER_SLOTS } from "./footballGmEngine";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS } from "./footballGmLongFoundation";

afterEach(cleanup);

describe("NFL GM Long player selection - iPhone overflow regression", () => {
  it.each(["OL", "FRONT 7", "DB"] as const)(
    "keeps Detroit %s options, all four pills, salary and Select together per card",
    (position) => {
      const { container } = render(
        <LongCandidateBoard teamCode="DET" picks={[]} onPick={vi.fn()} />,
      );
      fireEvent.click(screen.getByRole("button", { name: position }));
      const cards = Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          ".football-gm__picker-candidates > button.gm-long__candidate-choice",
        ),
      );
      expect(cards.length).toBeGreaterThanOrEqual(position === "DB" ? 5 : 6);
      for (const card of cards) {
        expect(card.querySelector(".gm-long__candidate-identity")).not.toBeNull();
        expect(card.querySelector(".football-wheel-picker__headshot")).not.toBeNull();
        expect(card.querySelector(".football-gm__candidate-tags")?.children).toHaveLength(4);
        const footer = card.querySelector(".gm-long__candidate-select");
        expect(footer).not.toBeNull();
        expect(footer?.textContent).toContain("SELECT");
        expect(footer?.textContent).toContain("$");
        expect(card.getAttribute("aria-label")).toMatch(/^Select .+ for \$/);
      }
      const allCandidates = nflGmLongTeamCandidates("DET", []);
      expect(allCandidates.length).toBeGreaterThanOrEqual(cards.length);
    },
  );

  it("removes the inherited capped scrolling grid and height-clipping styles in Long alone", () => {
    const css = readFileSync("src/styles/football-gm-long.css", "utf8");
    const start = css.indexOf("/* Long draft candidate list:");
    const end = css.indexOf("/* Coaching: preserve", start);
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const scopedCss = css.slice(start, end);
    expect(scopedCss).toMatch(/\.gm-long \.football-wheel-picker__candidates\.football-gm__picker-candidates\s*\{[^}]*max-height:\s*none;/s);
    expect(scopedCss).toMatch(/\.gm-long \.football-gm__picker-candidates > button\.gm-long__candidate-choice\s*\{[^}]*height:\s*auto;/s);
    expect(scopedCss).toMatch(/\.gm-long \.gm-long__candidate-identity\s*\{[^}]*grid-template-columns:/s);
    expect(scopedCss).toMatch(/\.gm-long \.football-gm__picker-candidates \.football-gm__picker-action\.gm-long__candidate-select\s*\{[^}]*display:\s*flex;/s);
    expect(scopedCss).not.toContain("overflow: hidden");
  });

  it("does not alter Short GM roster or either salary cap", () => {
    expect(FOOTBALL_GM_ROSTER_SLOTS).toHaveLength(7);
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(NFL_GM_LONG_SLOTS).toHaveLength(9);
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
  });
});
