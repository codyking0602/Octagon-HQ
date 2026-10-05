import { describe, expect, it } from "vitest";
import { footballHigherLowerBrandForSubject } from "./footballHigherLowerBranding";

describe("Football Higher or Lower branding", () => {
  it("uses the recognizable NFL identity for a career player", () => {
    expect(footballHigherLowerBrandForSubject("nfl-patrick-mahomes")).toMatchObject({
      name: "Kansas City Chiefs",
      primaryColor: "#E31837",
      secondaryColor: "#FFB81C",
    });
    expect(footballHigherLowerBrandForSubject("nfl-patrick-mahomes")?.logoSrc).toBeTruthy();
  });

  it("uses the college program identity for a CFB player", () => {
    const brand = footballHigherLowerBrandForSubject("cfb-joe-burrow");
    expect(brand).toMatchObject({ name: "LSU" });
    expect(brand?.primaryColor).toMatch(/^#/);
    expect(brand?.secondaryColor).toMatch(/^#/);
    expect(brand?.logoSrc).toBeTruthy();
  });

  it("fails neutral rather than inventing a team for an unknown subject", () => {
    expect(footballHigherLowerBrandForSubject("not-a-real-football-subject")).toBeNull();
  });
});
