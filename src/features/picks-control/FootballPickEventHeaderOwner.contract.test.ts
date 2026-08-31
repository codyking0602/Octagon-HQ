import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Football Picks event-header ownership contract", () => {
  it("routes the published Football slate into the existing Picks header owner", () => {
    const playerSource = readFileSync("src/features/picks/FootballPicksPage.tsx", "utf8");
    const controlSource = readFileSync("src/features/picks-control/PicksControlCenterPage.tsx", "utf8");
    const headerSource = readFileSync("src/features/picks-control/PickEventHeaderControl.tsx", "utf8");

    expect(playerSource).toContain("/picks/control?sport=football&event=");
    expect(playerSource).toContain("#header");
    expect(controlSource).toContain("<PickEventHeaderControl eventId={footballEventId} repository={controlRepository} />");
    expect(headerSource).toContain('import { uploadPickEventHeader } from "./pickEventHeaderUpload"');
  });

  it("does not create a second Football upload or storage path", () => {
    const playerSource = readFileSync("src/features/picks/FootballPicksPage.tsx", "utf8");
    const controlSource = readFileSync("src/features/picks-control/PicksControlCenterPage.tsx", "utf8");

    expect(playerSource).not.toContain("storage.from");
    expect(controlSource).not.toContain("storage.from");
    expect(controlSource).not.toContain("PICK_EVENT_HEADER_BUCKET");
  });
});
