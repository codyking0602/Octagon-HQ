import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  footballWavelengthCategoryLabel,
  footballWavelengthClueDescriptor,
  footballWavelengthCluePrompt,
} from "./footballWavelengthPresentation";

const footballDailyPage = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");

describe("Football Wavelength presentation", () => {
  it("presents Media Energy as Entertainment Value with clear player-facing guidance", () => {
    expect(footballWavelengthCategoryLabel("MEDIA ENERGY")).toBe("ENTERTAINMENT VALUE");
    expect(footballWavelengthCluePrompt("MEDIA ENERGY")).toContain("entertaining or compelling");
    expect(footballWavelengthCluePrompt("MEDIA ENERGY")).toContain("calibrated 1–100 opinion scale");
  });

  it("presents the former chaos bucket as a clear creativity question", () => {
    expect(footballWavelengthCategoryLabel("SCHEME & PLAY CREATIVITY")).toBe("SCHEME & PLAY CREATIVITY");
    expect(footballWavelengthClueDescriptor("SCHEME & PLAY CREATIVITY")).toBe("scheme and play creativity");
    expect(footballWavelengthCluePrompt("SCHEME & PLAY CREATIVITY")).toContain(
      "How creative or unconventional is this scheme or play?",
    );
    expect(footballWavelengthCluePrompt("SCHEME & PLAY CREATIVITY")).not.toContain("chaotic");
  });

  it("uses the canonical Football Wavelength page shell for the Daily game", () => {
    expect(footballDailyPage).toContain('if (projection.gameType === "wavelength")');
    expect(footballDailyPage).toContain(
      '"page football-debate-page football-wavelength-page wavelength-page wavelength-page--playing wavelength-page--football"',
    );
    expect(footballDailyPage).toContain('"page football-debate-page football-wavelength-page"');
    expect(footballDailyPage).not.toContain(
      '{projection.gameType === "wavelength" ? <Wavelength projection={projection} advance={advance} /> : null}',
    );
  });

  it("uses the canonical category question so each clue explains what the subject is measuring", () => {
    expect(footballWavelengthCategoryLabel("ATHLETIC FREAK")).toBe("ATHLETIC FREAK");
    expect(footballWavelengthCluePrompt("ATHLETIC FREAK")).toContain(
      "How extreme is the subject's raw football athleticism?",
    );
    expect(footballWavelengthCluePrompt("NFL LEGACY")).toContain(
      "How large is this subject's NFL legacy?",
    );
    expect(footballWavelengthCluePrompt("NFL LEGACY")).toContain("calibrated 1–100 opinion scale");
  });
});
