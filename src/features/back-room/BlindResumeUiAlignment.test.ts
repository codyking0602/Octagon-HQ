import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles/blind-resume-alignment.css", "utf8");
const footballPage = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");

describe("Blind Resume UFC and Football UI alignment", () => {
  it("keeps UFC gameplay intact while presenting every existing V3 reveal-stage score", () => {
    expect(css).toContain('.blind-resume-page[data-version="v3"] .blind-resume-apex-note::after');
    expect(css).toContain("2 STATS +20 / +2");
    expect(css).toContain("4 STATS +19 / +4");
    expect(css).toContain("6 STATS +18 / +6");
    expect(css).toContain("8 STATS +17 / +8");
    expect(css).toContain('.blind-resume-page[data-version="v3"] .blind-resume-card > .primary-action');
  });

  it("keeps Football blind before the pick and uses canonical team media only on reveal", () => {
    expect(footballPage).toContain("footballBlindResumeRevealAsset(subject.id)");
    expect(footballPage).toContain('className="football-blind-resume-logo"');
    expect(footballPage).toContain('<div><span>PLAYER A</span><strong>?</strong></div>');
    expect(footballPage).toContain('<div><span>PLAYER B</span><strong>?</strong></div>');
    expect(css).toContain("transform: translateY(12px);");
  });

  it("sanitizes both visible Football fact values and keeps the reveal CTA slim and full-width", () => {
    expect(footballPage).toContain("footballBlindResumeFactText(stat.value_a)");
    expect(footballPage).toContain("footballBlindResumeFactText(stat.value_b)");
    expect(footballPage).toContain('SHOW {moreFacts} MORE {moreFacts === 1 ? "FACT" : "FACTS"}');
    expect(css).toContain("width: calc(100% - 24px);");
  });
});
