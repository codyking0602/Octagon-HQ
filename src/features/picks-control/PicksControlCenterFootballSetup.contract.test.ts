import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("canonical Picks owner Football setup", () => {
  it("keeps /picks/control owned by PicksControlCenterPage and exposes Football setup inside that owner", () => {
    const control = readFileSync(new URL("./PicksControlCenterPage.tsx", import.meta.url), "utf8");
    const router = readFileSync(new URL("../../app/router.tsx", import.meta.url), "utf8");

    expect(router).toContain('path: "picks/control", element: <PicksControlCenterPage />');
    expect(router).not.toContain("PicksOwnerPage");
    expect(control).toContain('import FootballPicksSetupPage from "../picks-setup/FootballPicksSetupPage"');
    expect(control).toContain('aria-label="Picks owner sport"');
    expect(control).toContain('<FootballPicksSetupPage repository={setupRepository} />');
  });
});
