import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/features/play/MillionaireCasualPage.tsx", "utf8");
const dailySource = readFileSync("src/features/play/OfficialMillionaireDailyView.tsx", "utf8");
const fixedCss = readFileSync("src/features/play/MillionaireFixedStage.css", "utf8");

describe("Millionaire fixed-stage presentation contract", () => {
  it("keeps assembled sport backgrounds while composing MLB's cutout into the same fixed studio", () => {
    expect(pageSource).toContain("const stageHostAsset = millionaireHostAsset(league);");
    expect(pageSource).toContain('const stageBackground = league === "mlb" ? MILLIONAIRE_FIXED_STUDIO_BACKGROUND : stageHostAsset;');
    expect(pageSource).toContain('"/assets/millionaire/wide_cinematic_studio_shot_of_a_game_show_set_with.png"');
    expect(pageSource).toContain('className="millionaire-stage-background"');
    expect(pageSource).toContain('className="millionaire-stage-host-slot millionaire-stage-host-slot--mlb"');
    expect(pageSource).toContain('className="millionaire-stage-host" src={stageHostAsset}');
    expect(pageSource).not.toContain("millionaire-locked-stage");
    expect(pageSource).not.toContain("stagePlate");
    expect(pageSource).not.toContain("usesCleanProductionPlate");
  });

  it("keeps the standalone MLB host transparent in the approved host bay behind the fixed game chrome", () => {
    expect(fixedCss).toMatch(/\.millionaire-stage-host-slot \{[^}]*z-index: 4;[^}]*left: 198px;[^}]*bottom: 247px;[^}]*width: 509px;[^}]*height: 554px;[^}]*overflow: visible;[^}]*background: transparent;[^}]*box-shadow: none;/);
    expect(fixedCss).toMatch(/\.millionaire-stage-host-slot::before,\s*\.millionaire-stage-host-slot::after \{[^}]*content: none;[^}]*\}/);
    expect(fixedCss).not.toMatch(/\.millionaire-stage-host-slot \{[^}]*#01040b/);
    expect(fixedCss).not.toMatch(/\.millionaire-stage-host-slot::before \{[^}]*background:/);
    expect(fixedCss).not.toMatch(/\.millionaire-stage-host-slot::after \{[^}]*background:/);
    expect(fixedCss).toMatch(/\.millionaire-stage-host \{[\s\S]*?left: -7%;[\s\S]*?bottom: -1\.5%;[\s\S]*?width: 114%;[\s\S]*?height: 105%;[\s\S]*?object-fit: cover;[\s\S]*?object-position: center 38%;/);
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
    expect(pageSource).toContain("`${millionaireLeagueLabel(league)} DAILY`");
    expect(pageSource).toContain('league === "mlb" ? "MLB PLAYOFF CHALLENGE"');
    expect(pageSource).toContain("millionaireMoneyLabel(currentQuestion?.money ?? gameState.currentMoney)");
    expect(pageSource).toContain("millionaireTimeLabel(timeRemainingMs)");
    expect(pageSource).toContain("{currentQuestion?.prompt}");
    expect(pageSource).toContain("{choice.text}");
    expect(pageSource).toContain("MILLIONAIRE_BASE_PTS[ladderLevel]");
  });

  it("gives official Daily the rules intro, fullscreen priority, and a completion exit", () => {
    expect(dailySource).toContain('className="millionaire-shell millionaire-shell--rules"');
    expect(dailySource).toContain("START GAME");
    expect(dailySource).toContain("rulesOpen || answerFeedback || projection.officialAttempt");
    expect(dailySource).toContain("CONTINUE");
    expect(fixedCss).toMatch(/\.millionaire-shell--fixed-stage \{[\s\S]*?z-index: 99999 !important;/);
    expect(fixedCss).toMatch(/\.millionaire-shell--rules \{[\s\S]*?z-index: 99999 !important;/);
  });

  it("portals official Daily out of the app shell and restores answer feedback states", () => {
    expect(dailySource).toContain('import { createPortal } from "react-dom";');
    expect(dailySource).toContain("document.body");
    expect(dailySource).toContain('phase: "locked"');
    expect(dailySource).toContain('"is-selected"');
    expect(dailySource).toContain('"is-correct"');
    expect(dailySource).toContain('"is-wrong"');
    expect(dailySource).toContain("MILLIONAIRE_ANSWER_REVEAL_HOLD_MS");
    expect(dailySource).toContain("MILLIONAIRE_DOUBLE_DIP_MISS_MS");
  });

  it("runs Daily suspense in parallel with the authoritative request", () => {
    expect(dailySource).toContain("MILLIONAIRE_REVEAL_DELAY_MS[answerFeedback.level]");
    expect(dailySource).toContain("lockedAt: performance.now()");
    expect(dailySource).toContain("performance.now() - answerFeedback.lockedAt");
    expect(dailySource).toContain("Math.max(0, revealDelay - elapsedSinceLock)");
    expect(dailySource).toContain("}, remainingDelay);");
  });

  it("does not hide CFB Q1 answer text on the first render", () => {
    const refineCss = readFileSync("src/features/play/MillionairePortraitRefine.css", "utf8");
    expect(refineCss).not.toContain("millionaire-shell--cfb.millionaire-shell--q1.millionaire-shell--answering .millionaire-answers span");
  });

  it("does not hide CFB Q1 question text on the fixed-stage renderer", () => {
    const refineCss = readFileSync("src/features/play/MillionairePortraitRefine.css", "utf8");
    expect(refineCss).not.toContain("millionaire-shell--cfb.millionaire-shell--q1.millionaire-shell--answering .millionaire-question strong");
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
