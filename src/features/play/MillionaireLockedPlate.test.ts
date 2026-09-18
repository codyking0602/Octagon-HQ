import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/features/play/MillionaireCasualPage.tsx", "utf8");
const refineCss = readFileSync("src/features/play/MillionairePortraitRefine.css", "utf8");

describe("Millionaire locked plate presentation contract", () => {
  it("keeps the committed locked PNG as the game plate", () => {
    expect(pageSource).toContain('src="/assets/millionaire/millionaire-locked-reference.png"');
  });

  it("exposes league, level, and phase state without rebuilding the plate", () => {
    expect(pageSource).toContain("millionaire-shell--${league}");
    expect(pageSource).toContain("millionaire-shell--${level.toLowerCase()}");
    expect(pageSource).toContain("millionaire-shell--${phase}");
  });

  it("lets the locked artwork own the timer, lifeline, ladder, question, and answer chrome", () => {
    expect(refineCss).toContain(".millionaire-shell--game .millionaire-locked-stage");
    expect(refineCss).toContain("object-fit: fill;");
    expect(refineCss).toMatch(/\.millionaire-shell--game \.millionaire-clock \{[\s\S]*?background: transparent;[\s\S]*?box-shadow: none;/);
    expect(refineCss).toMatch(/\.millionaire-shell--game \.millionaire-lifelines button \{[\s\S]*?background: transparent;[\s\S]*?box-shadow: none;/);
    expect(refineCss).toMatch(/\.millionaire-shell--game \.millionaire-ladder \{[\s\S]*?background: transparent;[\s\S]*?box-shadow: none;/);
    expect(refineCss).toMatch(/\.millionaire-shell--game \.millionaire-question \{[\s\S]*?background: transparent;[\s\S]*?box-shadow: none;/);
    expect(refineCss).toMatch(/\.millionaire-shell--game \.millionaire-answers button \{[\s\S]*?background: transparent;[\s\S]*?box-shadow: none;/);
  });

  it("preserves the exact baked CFB Q1 resting composition", () => {
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--cfb .millionaire-title");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--q1 .millionaire-stakes");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--cfb.millionaire-shell--q1.millionaire-shell--answering .millionaire-question::before");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--cfb.millionaire-shell--q1.millionaire-shell--answering .millionaire-answers button::before");
  });
});
