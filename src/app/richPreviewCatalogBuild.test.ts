import { describe, expect, it } from "vitest";
import { plainBuildCopy } from "../../vite.config";

describe("rich preview catalog copy", () => {
  it("preserves canonical game-title casing while normalizing resume accents", () => {
    expect(plainBuildCopy("Blind Resume")).toBe("Blind Resume");
    expect(plainBuildCopy("Compare each fighter résumé")).toBe("Compare each fighter resume");
    expect(plainBuildCopy("Résumé showdown")).toBe("Resume showdown");
  });
});
