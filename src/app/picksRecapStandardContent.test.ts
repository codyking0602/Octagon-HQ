import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const recapSource = readFileSync("src/features/picks/LatestEventRecap.tsx", "utf8");

function position(marker: string) {
  const index = recapSource.indexOf(marker);
  expect(index).toBeGreaterThan(-1);
  return index;
}

describe("standard completed Picks recap content", () => {
  it("keeps the event recap in one predictable event-to-results order", () => {
    const hero = position("FINAL RESULTS");
    const champion = position("picks-event-recap__champion");
    const story = position("picks-event-recap__story");
    const awards = position("NIGHT AWARDS");
    const standings = position("Event Standings");
    const fights = position("Fight by Fight");

    expect(hero).toBeLessThan(champion);
    expect(champion).toBeLessThan(story);
    expect(story).toBeLessThan(awards);
    expect(awards).toBeLessThan(standings);
    expect(standings).toBeLessThan(fights);
  });

  it("keeps the night recap concise and derived from canonical results", () => {
    expect(recapSource).toContain('`${championCopy} ${recap.champions.length > 1 ? "shared the win" : "won the night"} with ${recap.winningPoints} points.`');
    expect(recapSource).toContain('`The room went ${recap.correctPicks}-${Math.max(0, recap.decidedPicks - recap.correctPicks)} on graded picks (${recap.groupAccuracy}%).`');
    expect(recapSource).toContain('`${fighterName(recap.roomTrap.bout, recap.roomTrap.bout.winnerFighterSlug)} was the toughest call of the card.`');
    expect(recapSource).not.toContain("Lorem ipsum");
  });

  it("renders only applicable awards instead of empty recap categories", () => {
    expect(recapSource).toContain("if (recap.bestCall)");
    expect(recapSource).toContain("if (recap.roomNailed)");
    expect(recapSource).toContain("if (recap.roomTrap)");
    expect(recapSource).toContain("if (recap.lockWinners.length)");
    expect(recapSource).not.toContain("No lock winner");
    expect(recapSource).not.toContain("No pick split available");
  });

  it("keeps the permanent event destination attached to recap sharing", () => {
    expect(recapSource).toContain('destination: { kind: "picks-recap", eventId: event.eventId }');
    expect(recapSource).toContain('"View your event recap in Octagon HQ:"');
  });
});
