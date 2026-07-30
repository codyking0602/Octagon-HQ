import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const seasonHub = readFileSync(
  fileURLToPath(new URL("./PicksSeasonHub.tsx", import.meta.url)),
  "utf8",
);

describe("canonical Picks destination consumption", () => {
  it("keeps the existing season archive as the one destination owner", () => {
    expect(seasonHub).toContain("resolvePicksDestination(searchParams, archivedEventIds)");
    expect(seasonHub).toContain('setActiveTab("events")');
    expect(seasonHub).toContain("setHubOpen(true)");
    expect(seasonHub).toContain("requestedOpen={event.eventId === targetEventId}");
  });

  it("does not add a second Picks recap route or browser-storage fallback", () => {
    expect(seasonHub).not.toContain("localStorage");
    expect(seasonHub).not.toContain("sessionStorage");
    expect(seasonHub).not.toContain("window.location.assign");
  });
});
