import { describe, expect, it } from "vitest";
import {
  footballBlindResumeFactText,
  footballBlindResumeRevealAsset,
} from "./footballBlindResumePresentation";

describe("Football Blind Resume presentation", () => {
  it("removes exact season years without changing the football fact itself", () => {
    expect(footballBlindResumeFactText("2012: 2,097 rushing yards · 6.0 yards per carry"))
      .toBe("2,097 rushing yards · 6.0 yards per carry");
    expect(footballBlindResumeFactText("Peak 1997 — 2,053 rushing yards"))
      .toBe("Peak 2,053 rushing yards");
    expect(footballBlindResumeFactText("1980s era · 4 Pro Bowls"))
      .toBe("1980s era · 4 Pro Bowls");
  });

  it("uses the canonical Football media owner for reveal logos", () => {
    const asset = footballBlindResumeRevealAsset("tom-brady");
    expect(asset?.kind).toBe("team-mark");
    expect(asset?.label).toContain("Patriots");
  });
});
