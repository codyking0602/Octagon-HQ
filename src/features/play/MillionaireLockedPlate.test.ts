import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/features/play/MillionaireCasualPage.tsx", "utf8");
const refineCss = readFileSync("src/features/play/MillionairePortraitRefine.css", "utf8");

describe("Millionaire locked plate presentation contract", () => {
  it("uses the clean production plate for the UFC playtest while keeping the approved reference for football", () => {
    expect(pageSource).toContain('usesCleanProductionPlate = league === "ufc"');
    expect(pageSource).toContain('"/assets/millionaire/wide_cinematic_game_show_studio_template_dark_bl_1.png"');
    expect(pageSource).toContain('"/assets/millionaire/millionaire-locked-reference.png"');
    expect(pageSource).toContain('" millionaire-shell--clean-plate"');
    expect(pageSource).toContain('src={stagePlate}');
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

  it("keeps gameplay inside the device safe area and masks baked later-question numbers", () => {
    const gameRule = refineCss.match(/\.millionaire-shell--game \{[\s\S]*?\}/)?.[0] ?? "";
    expect(gameRule).not.toContain("inset: 0;");
    expect(gameRule).not.toContain("width: 100vw;");
    expect(refineCss).toContain("linear-gradient(180deg, #07316c, #03183b 78%)");
    expect(refineCss).toContain("linear-gradient(180deg, #021435, #010818)");
  });

  it("matches lifeline hit-state overlays to the rendered locked-plate circles", () => {
    expect(refineCss).toContain("aspect-ratio: 1.137 / 1;");
  });

  it("keeps live answer text clear of the baked A-D labels", () => {
    expect(refineCss).toContain("grid-template-columns: 17% 83%;");
  });

  it("uses the clean plate without text-erasing masks", () => {
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--clean-plate .millionaire-question::before");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--clean-plate .millionaire-answers button::before");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--clean-plate .millionaire-ladder > div::after");
    expect(refineCss).toContain("display: none;");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--clean-plate .millionaire-question");
    expect(refineCss).toContain("bottom: 34.55%;");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--clean-plate .millionaire-answers");
    expect(refineCss).toContain("bottom: 16.7%;");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--clean-plate .millionaire-ladder");
    expect(refineCss).toContain("height: 51.6%;");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--clean-plate .millionaire-answers b");
    expect(refineCss).toContain("visibility: visible;");
  });

  it("preserves the exact baked CFB Q1 resting composition", () => {
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--cfb .millionaire-title");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--q1 .millionaire-stakes");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--cfb.millionaire-shell--q1.millionaire-shell--answering .millionaire-question::before");
    expect(refineCss).toContain(".millionaire-shell--game.millionaire-shell--cfb.millionaire-shell--q1.millionaire-shell--answering .millionaire-answers button::before");
  });
});
