import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/features/play/MillionaireCasualPage.tsx", "utf8");
const fixedCss = readFileSync("src/features/play/MillionaireFixedStage.css", "utf8");

describe("Millionaire fixed-stage presentation contract", () => {
  it("uses the sport-scoped rotating background host without changing fixed-stage geometry", () => {
    expect(pageSource).toContain("const stageBackground = millionaireHostAsset(league);");
    expect(pageSource).toContain('className="millionaire-stage-background"');
    expect(pageSource).not.toContain("millionaire-locked-stage");
    expect(pageSource).not.toContain("stagePlate");
    expect(pageSource).not.toContain("usesCleanProductionPlate");
  });

  it("renders gameplay on a single fixed 1600x900 coordinate system", () => {
    expect(pageSource).toContain("const MILLIONAIRE_STAGE_WIDTH = 1600");
    expect(pageSource).toContain("const MILLIONAIRE_STAGE_HEIGHT = 900");
    expect(pageSource).toContain("Math.min(viewportWidth / MILLIONAIRE_STAGE_WIDTH, viewportHeight / MILLIONAIRE_STAGE_HEIGHT)");
    expect(pageSource).toContain('className="millionaire-stage-canvas"');
    expect(pageSource).toContain('translate(-50%, -50%) scale(${stageScale})');
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage > \.millionaire-stage-canvas \{[\s\S]*?width: 1600px;[\s\S]*?height: 900px;/);
  });

  it("uses the image only for the photographic background", () => {
    expect(fixedCss).toMatch(/\.millionaire-stage-background \{[\s\S]*?width: 1600px;[\s\S]*?height: 900px;[\s\S]*?object-fit: cover;/);
    expect(fixedCss).toContain(".millionaire-shell--fixed-stage .millionaire-arena");
    expect(fixedCss).toContain(".millionaire-shell--fixed-stage .millionaire-locked-stage");
    expect(fixedCss).toContain("display: none !important;");
  });

  it("owns all gameplay chrome in CSS instead of baked plate pixels", () => {
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage \.millionaire-stakes \{[\s\S]*?clip-path:/);
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage \.millionaire-clock \{[\s\S]*?conic-gradient/);
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage \.millionaire-ladder \{[\s\S]*?grid-template-rows: repeat\(8, 1fr\)/);
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage \.millionaire-question \{[\s\S]*?left: 266px;[\s\S]*?top: 510px;/);
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage \.millionaire-answers \{[\s\S]*?left: 252px;[\s\S]*?top: 650px;/);
  });

  it("keeps all changing content live in React", () => {
    expect(pageSource).toContain("{millionaireLeagueLabel(league)} DAILY");
    expect(pageSource).toContain("millionaireMoneyLabel(currentQuestion?.money ?? gameState.currentMoney)");
    expect(pageSource).toContain("millionaireTimeLabel(timeRemainingMs)");
    expect(pageSource).toContain("{currentQuestion?.prompt}");
    expect(pageSource).toContain("{choice.text}");
    expect(pageSource).toContain("MILLIONAIRE_BASE_PTS[ladderLevel]");
  });

  it("does not hide CFB Q1 answer text on the first render", () => {
    const refineCss = readFileSync("src/features/play/MillionairePortraitRefine.css", "utf8");
    expect(refineCss).not.toContain("millionaire-shell--cfb.millionaire-shell--q1.millionaire-shell--answering .millionaire-answers span");
  });

  it("keeps gameplay states independent from the background image", () => {
    expect(fixedCss).toContain(".millionaire-answers button.is-selected");
    expect(fixedCss).toContain(".millionaire-answers button.is-correct");
    expect(fixedCss).toContain(".millionaire-answers button.is-wrong");
    expect(fixedCss).toContain(".millionaire-lifelines button.is-spent");
    expect(fixedCss).toContain(".millionaire-ladder > div.is-current::before");
  });

  it("renders complete angled outlines and fixed-size dialog typography", () => {
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage \.millionaire-stakes::before[\s\S]*?inset: 3px;[\s\S]*?clip-path:/);
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage \.millionaire-question::before[\s\S]*?inset: 3px;[\s\S]*?clip-path:/);
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage \.millionaire-answers button::before[\s\S]*?inset: 2px;[\s\S]*?clip-path:/);
    expect(fixedCss).toContain(".millionaire-shell--fixed-stage .millionaire-stat-sheet p");
    expect(fixedCss).toContain("font-size: 20px;");
    expect(fixedCss).toContain(".millionaire-shell--fixed-stage .millionaire-decision > strong");
    expect(fixedCss).toContain("font-size: 28px;");
    expect(fixedCss).toContain(".millionaire-shell--fixed-stage .millionaire-results > strong");
    expect(fixedCss).toContain("font-size: 58px;");
  });
});
