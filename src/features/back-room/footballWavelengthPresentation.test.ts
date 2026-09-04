import { describe, expect, it } from "vitest";
import {
  footballWavelengthCategoryLabel,
  footballWavelengthCluePrompt,
} from "./footballWavelengthPresentation";

describe("Football Wavelength presentation", () => {
  it("presents Media Energy as Entertainment Value with clear player-facing guidance", () => {
    expect(footballWavelengthCategoryLabel("MEDIA ENERGY")).toBe("ENTERTAINMENT VALUE");
    expect(footballWavelengthCluePrompt("MEDIA ENERGY")).toContain("entertaining or compelling");
    expect(footballWavelengthCluePrompt("MEDIA ENERGY")).toContain("calibrated 1–100 opinion scale");
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
