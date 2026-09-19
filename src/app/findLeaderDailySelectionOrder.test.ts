import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ufc = readFileSync("src/features/play/OfficialTodayChallengePresentation.tsx", "utf8");
const football = readFileSync("src/features/back-room/FootballFindLeaderPresentation.tsx", "utf8");
const playCss = readFileSync("src/styles/play.css", "utf8");
const footballCss = readFileSync("src/styles/football-find-leader.css", "utf8");

describe("Daily Find the Leader result selection order", () => {
  it("renders the persisted UFC elimination sequence before the sorted stat reveal", () => {
    expect(ufc).toContain("const storedEliminated = strings(attempt.publicResult.eliminated_ids)");
    expect(ufc).toContain("const eliminationOrder = resultEliminated");
    expect(ufc).toContain(".map((id) => revealedById.get(id))");
    expect(ufc).toContain('className="surface-card find-elimination-order"');
    expect(ufc).toContain("ELIMINATION ORDER");
    expect(ufc).toContain('row.id === fatalId ? "LEADER" : "SAFE"');
    expect(ufc.indexOf("find-elimination-order")).toBeLessThan(ufc.indexOf("surface-card find-reveal"));
  });

  it("renders Football selections in eliminatedIds order without hiding season identity", () => {
    expect(football).toContain("const eliminationOrder = eliminatedIds");
    expect(football).toContain(".map((id) => candidatesById.get(id))");
    expect(football).toContain('className="football-find-order"');
    expect(football).toContain("candidate.displayName ?? candidate.name");
    expect(football).toContain("candidate.season != null");
    expect(football).toContain('candidate.id === result.fatalId ? "LEADER" : "SAFE"');
  });

  it("keeps the selection-order recap compact and mobile safe in both sports", () => {
    expect(playCss).toContain(".find-elimination-order__row");
    expect(playCss).toContain("grid-template-columns: 28px minmax(0, 1fr) auto");
    expect(footballCss).toContain(".football-find-order article");
    expect(footballCss).toContain(".football-find-order__identity");
    expect(footballCss).toContain("white-space: nowrap");
  });
});
