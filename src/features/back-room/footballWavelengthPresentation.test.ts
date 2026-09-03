import { describe, expect, it } from "vitest";
import {
  footballWavelengthCategoryLabel,
  footballWavelengthCluePrompt,
} from "./footballWavelengthPresentation";

describe("Football Wavelength presentation", () => {
  it("presents Media Energy as Entertainment Value with clear player-facing guidance", () => {
    expect(footballWavelengthCategoryLabel("MEDIA ENERGY")).toBe("ENTERTAINMENT VALUE");
    expect(footballWavelengthCluePrompt("MEDIA ENERGY")).toContain("entertaining or compelling");
  });

  it("leaves every other canonical category label and prompt unchanged", () => {
    expect(footballWavelengthCategoryLabel("NFL LEGACY")).toBe("NFL LEGACY");
    expect(footballWavelengthCluePrompt("NFL LEGACY")).toBe(
      "Where does it land on Football HQ’s calibrated 1–100 football opinion scale?",
    );
  });
});
