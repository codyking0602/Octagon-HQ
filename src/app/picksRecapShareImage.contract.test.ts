import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/features/picks/picksRecapShareImage.ts", "utf8");

describe("Picks recap share image", () => {
  it("contains event-wide results and no viewer-specific result fields", () => {
    expect(source).toContain("FINAL STANDINGS");
    expect(source).toContain("MUST-WATCH MOMENT");
    expect(source).toContain("VIEW YOUR EVENT RECAP");
    expect(source).not.toContain("YOUR PICKS");
    expect(source).not.toContain("YOUR POINTS");
    expect(source).not.toContain("isCurrentUser");
  });
});
