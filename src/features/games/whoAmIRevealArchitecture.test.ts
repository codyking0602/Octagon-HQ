import { describe, expect, it } from "vitest";
import type { WhoAmIClue } from "./whoAmIEngine";
import {
  orderWhoAmICluesByRevealArchitectureIfPossible,
  whoAmIMajorIdentityCoordinates,
  whoAmIRevealArchitectureCanOrder,
  whoAmIRevealArchitectureSatisfied,
  whoAmIRevealCoordinateProgressionSatisfied,
  whoAmIRevealProfile,
} from "./whoAmIRevealArchitecture";

function clue(
  id: string,
  text: string,
  band: WhoAmIClue["band"],
  facet: NonNullable<WhoAmIClue["facet"]>,
): WhoAmIClue {
  return { id, text, band, facet };
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
      earliestClue: 4,
    });
    expect(whoAmIRevealProfile(upbringing)).toMatchObject({
      category: "personal-biography",
      earliestClue: 8,
    });
  });

  it("reorders within the existing band ladder without changing its clue set", () => {
    const selected: WhoAmIClue[] = [
      clue("role", "I played wide receiver.", "broad", "role"),
      clue("era", "I played in the 2000s and 2010s.", "broad", "era"),
      clue("school", "I played college football at Alabama.", "helpful", "background"),
      clue("style-helpful", "I was known for precise route running.", "helpful", "style"),
      clue("name-change", "I legally changed my surname to Ochocinco.", "strong", "nickname"),
      clue("production", "I finished with more than 700 receptions.", "strong", "production"),
      clue("draft", "I was selected No. 36 overall in the NFL Draft.", "strong", "career-path"),
      clue("award", "I earned six Pro Bowl selections.", "strong", "accomplishments"),
      clue("team", "I spent most of my career with Cincinnati.", "strong", "career-path"),
      clue("jersey", "I wore No. 85.", "giveaway", "identity"),
    ];

    expect(whoAmIRevealArchitectureCanOrder(selected, "NFL")).toBe(true);
    const ordered = orderWhoAmICluesByRevealArchitectureIfPossible(selected, "NFL");

    expect(ordered.map((entry) => entry.id).sort()).toEqual(selected.map((entry) => entry.id).sort());
    expect(ordered.findIndex((entry) => entry.id === "name-change")).toBeGreaterThanOrEqual(8);
    expect(ordered.findIndex((entry) => entry.id === "jersey")).toBeGreaterThanOrEqual(7);
    expect(ordered.slice(-2).every((entry) => entry.band === "strong" || entry.band === "giveaway")).toBe(true);
    expect(whoAmIRevealCoordinateProgressionSatisfied(ordered, "NFL")).toBe(true);
    expect(new Set(ordered.slice(0, 4).flatMap((entry) => whoAmIMajorIdentityCoordinates(entry, "NFL"))).size).toBeLessThanOrEqual(1);
    expect(new Set(ordered.slice(0, 6).flatMap((entry) => whoAmIMajorIdentityCoordinates(entry, "NFL"))).size).toBeLessThanOrEqual(2);
    expect(whoAmIRevealArchitectureSatisfied(ordered, "NFL")).toBe(true);
  });

  it("limits football boards to one identity coordinate through clue 4, two through clue 6, and three from clue 7", () => {
    const selected: WhoAmIClue[] = [
      { ...clue("role", "I played quarterback.", "broad", "role"), identityCoordinates: ["role"] },
      { ...clue("era", "I was active in the 2010s.", "broad", "era"), identityCoordinates: ["era"] },
      clue("style", "I was a dangerous runner outside structure.", "helpful", "style"),
      clue("draft", "I was a first-round NFL Draft pick.", "helpful", "career-path"),
      clue("award", "I earned major national player-of-the-year recognition.", "strong", "accomplishments"),
      { ...clue("team", "I played for the New England Patriots.", "strong", "career-path"), identityCoordinates: ["team"] },
      clue("playoff", "I delivered multiple memorable postseason performances.", "strong", "accomplishments"),
      clue("record", "I set a major league record during my career.", "strong", "accomplishments"),
      clue("signature", "I was central to an iconic championship moment.", "giveaway", "accomplishments"),
      clue("jersey", "I wore No. 12.", "giveaway", "identity"),
    ];

    const ordered = orderWhoAmICluesByRevealArchitectureIfPossible(selected, "NFL");
    expect(whoAmIRevealCoordinateProgressionSatisfied(ordered, "NFL")).toBe(true);
    expect(new Set(ordered.slice(0, 4).flatMap((entry) => whoAmIMajorIdentityCoordinates(entry, "NFL"))).size).toBeLessThanOrEqual(1);
    expect(new Set(ordered.slice(0, 6).flatMap((entry) => whoAmIMajorIdentityCoordinates(entry, "NFL"))).size).toBeLessThanOrEqual(2);
    expect(new Set(ordered.slice(0, 8).flatMap((entry) => whoAmIMajorIdentityCoordinates(entry, "NFL"))).size).toBeLessThanOrEqual(3);
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
