import { describe, expect, it } from "vitest";
import type { WhoAmIClue } from "./whoAmIEngine";
import {
  isStrongLateAnchor,
  orderWhoAmICluesByRevealArchitectureIfPossible,
  whoAmIRevealArchitectureCanOrder,
  whoAmIRevealArchitectureSatisfied,
  whoAmIRevealProfile,
} from "./whoAmIRevealArchitecture";

function clue(
  id: string,
  text: string,
  band: WhoAmIClue["band"],
  facet: NonNullable<WhoAmIClue["facet"]>,
  revealCoordinates: NonNullable<WhoAmIClue["revealCoordinates"]> = [],
): WhoAmIClue {
  return {
    id,
    text,
    band,
    facet,
    ...(revealCoordinates.length ? { revealCoordinates } : {}),
  };
}

describe("Who Am I standardized reveal architecture", () => {
  it("treats powerhouse schools as earlier foundation clues and distinctive schools as later identifiers", () => {
    const alabama = clue("school-alabama", "I played college football at Alabama.", "helpful", "background");
    const oregonState = clue("school-oregon-state", "I played college football at Oregon State.", "helpful", "background");

    expect(whoAmIRevealProfile(alabama)).toMatchObject({
      category: "school",
      identifyingPower: "broad",
      earliestClue: 3,
    });
    expect(whoAmIRevealProfile(oregonState)).toMatchObject({
      category: "school",
      identifyingPower: "signature",
      earliestClue: 6,
    });
  });

  it("does not treat an inferred raw production stat as a strong late identity anchor", () => {
    const rawProduction: WhoAmIClue = {
      id: "fact:nfl-career-passing-touchdowns",
      text: "I finished my NFL career with 152 passing touchdowns.",
      band: "strong",
      revealCoordinates: [],
    };

    expect(whoAmIRevealProfile(rawProduction).category).toBe("production");
    expect(isStrongLateAnchor(rawProduction)).toBe(false);
  });

  it("reserves jersey numbers and nickname or name-change clues for the finish", () => {
    const jersey = clue("jersey", "I wore No. 85.", "strong", "identity");
    const nameChange = clue(
      "name-change",
      "I legally changed my surname to Ochocinco.",
      "strong",
      "nickname",
    );

    expect(whoAmIRevealProfile(jersey).earliestClue).toBe(8);
    expect(whoAmIRevealProfile(nameChange)).toMatchObject({
      category: "nickname-persona",
      earliestClue: 9,
    });
  });

  it("keeps sports biography separate from personal biography", () => {
    const juco = clue(
      "juco-route",
      "I reached Oregon State after starting in junior college.",
      "helpful",
      "background",
    );
    const upbringing = clue(
      "upbringing",
      "I was raised largely by my grandmother.",
      "strong",
      "off-field",
    );

    expect(whoAmIRevealProfile(juco)).toMatchObject({
      category: "sports-biography",
      identifyingPower: "signature",
      earliestClue: 6,
    });
    expect(whoAmIRevealProfile(upbringing)).toMatchObject({
      category: "personal-biography",
      earliestClue: 8,
    });
  });

  it("reorders within the existing band ladder without changing its clue set", () => {
    const selected: WhoAmIClue[] = [
      clue("role", "I played wide receiver.", "broad", "role", ["position"]),
      clue("era", "I played in the 2000s and 2010s.", "broad", "era", ["era"]),
      clue("school", "I played college football at Alabama.", "helpful", "background", ["school"]),
      clue("style-helpful", "I was known for precise route running.", "helpful", "style"),
      clue("name-change", "I legally changed my surname to Ochocinco.", "strong", "nickname"),
      clue("production", "I finished with more than 700 receptions.", "strong", "production"),
      clue("draft", "I was selected No. 36 overall in the NFL Draft.", "strong", "career-path"),
      clue("award", "I earned six Pro Bowl selections.", "strong", "accomplishments"),
      clue("team", "I spent most of my career with Cincinnati.", "strong", "career-path"),
      clue("jersey", "I wore No. 85.", "giveaway", "identity"),
    ];

    expect(whoAmIRevealArchitectureCanOrder(selected)).toBe(true);
    const ordered = orderWhoAmICluesByRevealArchitectureIfPossible(selected);

    expect(ordered.map((entry) => entry.id).sort()).toEqual(selected.map((entry) => entry.id).sort());
    expect(ordered.findIndex((entry) => entry.id === "name-change")).toBeGreaterThanOrEqual(8);
    expect(ordered.findIndex((entry) => entry.id === "jersey")).toBeGreaterThanOrEqual(7);
    expect(ordered.slice(-2).every((entry) => entry.band === "strong" || entry.band === "giveaway")).toBe(true);

    const coordinateCount = (count: number) => new Set(
      ordered.slice(0, count).flatMap((entry) => entry.revealCoordinates ?? []),
    ).size;
    expect(coordinateCount(4)).toBeLessThanOrEqual(1);
    expect(coordinateCount(6)).toBeLessThanOrEqual(2);
    expect(coordinateCount(8)).toBeLessThanOrEqual(3);
    expect(whoAmIRevealArchitectureSatisfied(ordered)).toBe(true);
  });

  it("treats a clue that exposes two major coordinates as too identifying for clues 1-4", () => {
    const roleSchool = clue(
      "role-school",
      "At Clemson, I played quarterback.",
      "helpful",
      "identity",
      ["school", "position"],
    );
    const fillers: WhoAmIClue[] = [
      clue("style", "I was a dangerous runner in space.", "broad", "style"),
      clue("award", "I earned conference player-of-the-year honors.", "helpful", "accomplishments"),
      clue("draft", "I was a first-round NFL draft pick.", "strong", "career-path"),
      clue("title", "I won a national championship.", "strong", "accomplishments"),
      clue("record", "I set a school record in a postseason game.", "strong", "accomplishments"),
      clue("moment", "I delivered a late game-winning drive.", "strong", "accomplishments"),
      clue("era", "I played in the 2010s.", "broad", "era", ["era"]),
      clue("jersey", "I wore No. 4.", "giveaway", "identity"),
      clue("nickname", "I had a widely known nickname.", "giveaway", "nickname"),
    ];

    const ordered = orderWhoAmICluesByRevealArchitectureIfPossible([roleSchool, ...fillers]);
    expect(ordered.findIndex((entry) => entry.id === "role-school")).toBeGreaterThanOrEqual(4);
    expect(whoAmIRevealArchitectureSatisfied(ordered)).toBe(true);
  });

  it("leaves a thin board unchanged instead of rewriting its facts or replay behavior", () => {
    const selected: WhoAmIClue[] = [
      clue("role", "I played defensive back.", "broad", "role"),
      clue("era", "I played in the 2020s.", "broad", "era"),
      clue("school", "I played college football at Notre Dame.", "helpful", "background"),
      clue("production", "I made eight interceptions.", "strong", "production"),
      clue("award", "I earned All-America honors.", "strong", "accomplishments"),
      clue("game", "I returned an interception for a touchdown.", "strong", "accomplishments"),
      clue("season", "I led my team in tackles.", "strong", "accomplishments"),
      clue("draft", "I was drafted in the first round.", "strong", "career-path"),
      clue("brother", "My brother played college basketball.", "strong", "off-field"),
      clue("family", "My family lived overseas because of my father's basketball career.", "strong", "off-field"),
    ];

    expect(whoAmIRevealArchitectureCanOrder(selected)).toBe(false);
    expect(orderWhoAmICluesByRevealArchitectureIfPossible(selected)).toEqual(selected);
  });
});
