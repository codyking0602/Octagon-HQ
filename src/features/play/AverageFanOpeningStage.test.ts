import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/features/play/AverageFanPrototypePage.tsx", "utf8");
const pageCss = readFileSync("src/features/play/AverageFanPrototypePage.css", "utf8");

describe("Average Fan opening stage presentation contract", () => {
  it("scales the approved 1672x941 opening plate as one fixed landscape stage", () => {
    expect(pageSource).toContain("const AVERAGE_FAN_OPENING_STAGE_WIDTH = 1672;");
    expect(pageSource).toContain("const AVERAGE_FAN_OPENING_STAGE_HEIGHT = 941;");
    expect(pageSource).toContain("viewportWidth / AVERAGE_FAN_OPENING_STAGE_WIDTH");
    expect(pageSource).toContain("viewportHeight / AVERAGE_FAN_OPENING_STAGE_HEIGHT");
    expect(pageSource).toContain("Math.min(");
    expect(pageSource).toContain('translate(-50%, -50%) scale(${openingStageScale})');
    expect(pageCss).toMatch(/\.average-fan-intro--plate \.average-fan-intro-stage \{[\s\S]*?width: 1672px;[\s\S]*?height: 941px;/);
    expect(pageCss).toMatch(/\.average-fan-intro-stage__plate \{[\s\S]*?width: 1672px;[\s\S]*?height: 941px;[\s\S]*?object-fit: contain;/);
  });

  it("keeps the approved image intact and the two baked button shells live", () => {
    expect(pageSource).toContain('src="/assets/average-fan/average-fan-opening-stage.png"');
    expect(pageSource).toContain('className="average-fan-intro-stage__button average-fan-intro-stage__button--start"');
    expect(pageSource).toContain('className="average-fan-intro-stage__button average-fan-intro-stage__button--rules"');
    expect(pageSource).toContain("<strong>START</strong>");
    expect(pageSource).toContain("<strong>HOW TO PLAY</strong>");
    expect(pageSource).toContain('onClick={() => setScene("fan-select")}');
    expect(pageSource).toContain("onClick={() => setRulesOpen(true)}");
    expect(pageCss).not.toContain("object-fit: fill");
  });

  it("keeps How to Play comfortably inside its blue shell", () => {
    expect(pageCss).toMatch(/\.average-fan-intro-stage__button--rules \{[\s\S]*?gap: 12px;[\s\S]*?padding-inline: 24px;[\s\S]*?font-size: 30px;/);
    expect(pageCss).toMatch(/\.average-fan-intro-stage__button--rules > span \{[\s\S]*?font-size: 0\.72em;/);
  });

  it("uses the Millionaire-style rotate-to-play guard in portrait", () => {
    expect(pageCss).toContain("@media (orientation: portrait)");
    expect(pageCss).toMatch(/\.average-fan-intro--plate > \* \{[\s\S]*?visibility: hidden !important;[\s\S]*?pointer-events: none !important;/);
    expect(pageCss).toContain('content: "↻\\A ROTATE TO PLAY\\A Average Fan is landscape only.";');
  });

  it("preserves the existing HQ exit behavior", () => {
    expect(pageSource).toContain('className="average-fan-exit"');
    expect(pageSource).toContain('onClick={() => navigate("/play")}');
    expect(pageSource).toContain("‹ HQ");
  });
});
