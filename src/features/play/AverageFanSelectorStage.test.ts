import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/features/play/AverageFanPrototypePage.tsx", "utf8");
const pageCss = readFileSync("src/features/play/AverageFanPrototypePage.css", "utf8");

describe("Average Fan selector stage presentation contract", () => {
  it("uses the approved 1672x941 selector plate on the shared fixed-stage scale", () => {
    expect(pageSource).toContain('src="/assets/average-fan/average-fan-selector-stage.png"');
    expect(pageSource).toContain("const stageScale = useAverageFanOpeningStageScale();");
    expect(pageSource).toContain('className="average-fan-selector-stage"');
    expect(pageSource).toContain('translate(-50%, -50%) scale(${stageScale})');
    expect(pageCss).toMatch(/\.average-fan-selector-stage \{[\s\S]*?width: 1672px;[\s\S]*?height: 941px;/);
    expect(pageCss).toMatch(/\.average-fan-selector-stage__plate \{[\s\S]*?width: 1672px;[\s\S]*?height: 941px;[\s\S]*?object-fit: contain;/);
  });

  it("keeps the five baked portrait cards live without rebuilding their artwork", () => {
    expect(pageSource).toContain('className={`average-fan-card average-fan-card--${fan}${selected ? " is-selected" : ""}`}');
    expect(pageSource).not.toContain("<FanAvatar fan={fan} />\n      <strong>{FAN_LABELS[fan]}</strong>");
    expect(pageCss).toMatch(/\.average-fan-card \{[\s\S]*?background: transparent;[\s\S]*?pointer-events: auto;/);
    expect(pageCss).toMatch(/\.average-fan-card\.is-selected \{[\s\S]*?border-color: #ffd54b;[\s\S]*?box-shadow:/);
    expect(pageCss).not.toMatch(/\.average-fan-card\.is-selected::before/);
  });

  it("uses the opened board for live fan name, report grades, and the blank baked select shell", () => {
    expect(pageSource).toContain("<h2>{FAN_LABELS[selectedFan]}</h2>");
    expect(pageSource).toContain("{averageFanSubjectIcon(subject)}");
    expect(pageSource).toContain("<span>{subject}</span>");
    expect(pageSource).toContain("<strong data-grade={grade}>{grade}</strong>");
    expect(pageSource).toContain("<strong>SELECT FAN</strong>");
    expect(pageCss).toMatch(/\.average-fan-report \{[\s\S]*?left: 738px;[\s\S]*?width: 698px;/);
    expect(pageCss).toMatch(/\.average-fan-select-button \{[\s\S]*?left: 575px;[\s\S]*?top: 759px;[\s\S]*?background: transparent;/);
  });

  it("removes the full-body selected fan treatment and stays landscape-only", () => {
    const selectorStart = pageSource.indexOf("function FanSelector");
    const selectorEnd = pageSource.indexOf("function MoneyRail", selectorStart);
    const selectorSource = pageSource.slice(selectorStart, selectorEnd);
    expect(selectorSource).not.toContain("average-fan-selector-hero");
    expect(selectorSource).not.toContain("average-fan-selector-pedestal");
    expect(pageCss).toContain("@media (orientation: portrait)");
    expect(pageCss).toContain('content: "↻\\A ROTATE TO PLAY\\A Average Fan is landscape only.";');
  });

  it("preserves the existing back behavior", () => {
    expect(pageSource).toContain('onClick={onBack} aria-label="Back to opening screen">‹ BACK</button>');
  });
});
