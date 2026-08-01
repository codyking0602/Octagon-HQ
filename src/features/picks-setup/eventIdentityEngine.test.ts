import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { matchSourceIdentity, type NormalizedArticleEvent, type NormalizedUfcEvent } from "../../../supabase/functions/sync-next-ufc-event/identityEngine";
import {
  canonicalFightPair,
  canonicalFighterDisplay,
  fighterMatch,
  normalizeText,
} from "../../../supabase/functions/sync-next-ufc-event/normalization";

const ufc: NormalizedUfcEvent = {
  canonicalEventKey: "event/test",
  promotion: "UFC",
  eventType: "fight-night",
  eventNumber: "",
  eventName: "UFC Fight Night",
  headliners: ["Uroš Medić Jr.", "Daniel Rodriguez III"],
  startsAt: "2026-08-02T00:00:00Z",
  localEventDate: "2026-08-01",
  venue: "Belgrade Arena",
  city: "Belgrade",
  region: "",
  country: "Serbia",
  canonicalUrl: "https://ufc.com/event/test",
  extractionEvidence: ["fixture"],
};

const article: NormalizedArticleEvent = {
  canonicalUrl: "https://www.mmamania.com/example",
  articleTitle: "Fight card",
  explicitEventName: "UFC Fight Night",
  eventNumber: "",
  headliners: ["Daniel Rodriguez", "Uros Medic"],
  explicitEventDates: ["2026-08-01"],
  publicationDates: ["2026-07-27"],
  venueSignals: ["Belgrade Arena"],
  locationSignals: ["Belgrade, Serbia"],
  cardSections: ["main-event", "main"],
  bouts: [0, 1, 2, 3].map((n) => ({
    section: n ? "main" : "main-event",
    red_fighter_name: n ? `Red ${n}` : "Daniel Rodriguez",
    blue_fighter_name: n ? `Blue ${n}` : "Uros Medic",
    weight_class: "",
  })),
  extractionEvidence: ["fixture"],
};

describe("durable event identity", () => {
  it("normalizes accents, punctuation, suffixes, and reversed order", () => {
    expect(normalizeText("O’Malley–García")).toBe("o malley garcia");
    expect(fighterMatch("Uroš Medić Jr.", "Uros Medic")).toBe(true);
    expect(canonicalFightPair("Marcin Tybura", "Aleksandar Rakić"))
      .toBe(canonicalFightPair("Aleksandar Rakic", "Marcin Tybura"));
    expect(matchSourceIdentity(ufc, article).accepted).toBe(true);
  });

  it("removes an article-only trailing rematch marker from fighter display identity", () => {
    expect(canonicalFighterDisplay("Bogdan Guskov 2")).toBe("Bogdan Guskov");
    expect(canonicalFightPair("Jan Błachowicz", "Bogdan Guskov 2"))
      .toBe(canonicalFightPair("Bogdan Guskov", "Jan Blachowicz"));
  });

  it("keeps publication dates separate and rejects an explicit wrong event date", () => {
    const result = matchSourceIdentity(ufc, { ...article, explicitEventDates: ["2026-08-10"] });
    expect(result.accepted).toBe(false);
    expect(result.conflicts[0]).toContain("event-date");
  });

  it("rejects unrelated cards and generic branding", () => {
    const result = matchSourceIdentity(ufc, {
      ...article,
      headliners: [],
      explicitEventDates: [],
      venueSignals: [],
      locationSignals: [],
      bouts: article.bouts.map((bout) => ({
        ...bout,
        red_fighter_name: "Wrong Person",
        blue_fighter_name: "Other Person",
      })),
    });
    expect(result.accepted).toBe(false);
    expect(result.conflicts).toContain("neither-headliner-matches");
  });

  it("accepts numbered cards only with the exact event number", () => {
    const numbered = { ...ufc, eventType: "numbered" as const, eventNumber: "999", eventName: "UFC 999" };
    expect(matchSourceIdentity(numbered, { ...article, eventNumber: "999" }).accepted).toBe(true);
    expect(matchSourceIdentity(numbered, { ...article, eventNumber: "998" }).accepted).toBe(false);
  });




  it("wires canonical UFC adapter fields into the final ParsedEvent payload", () => {
    const source = readFileSync(resolve(
      process.cwd(),
      "supabase/functions/sync-next-ufc-event/index.ts",
    ), "utf8");

    expect(source).toContain("const canonicalMetadata = canonicalUfcEventFields(metadata.normalized);");
    expect(source).toMatch(/const event: ParsedEvent = \{[\s\S]*\.\.\.canonicalMetadata,[\s\S]*source_url: card\.sourceUrl/);
    expect(source).toMatch(/function cleanFighterName[\s\S]*canonicalFighterDisplay/);
    expect(source).not.toContain("venue: metadata.venue");
    expect(source).not.toContain("location: metadata.location");
  });

});
