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
import {
  adaptMmaManiaSource,
  adaptUfcSource,
  canonicalUfcEventFields,
} from "../../../supabase/functions/sync-next-ufc-event/sourceAdapters";

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

  it("uses official UFC metadata as the final clean staged event metadata", () => {
    const html = `<!doctype html><html><head>
      <title>UFC Fight Night: Uroš Medić vs Daniel Rodriguez | UFC Belgrade</title>
      <meta property="og:description" content="Don't Miss A Moment Of UFC Fight Night: Uroš Medić vs Daniel Rodriguez, Live From Belgrade Arena In Belgrade, Serbia On August 1, 2026">
      <script type="application/json">{"page":"event"}</script>
    </head><body><h1>UFC Fight Night</h1><h2>Main navigation</h2></body></html>`;
    const adapted = adaptUfcSource(
      html,
      "https://www.ufc.com/event/ufc-fight-night-august-01-2026",
      {
        name: "UFC Fight Night",
        subtitle: "Bar UFC Fight Pass UFC Video Archive UFC Fight Night Medic vs Rodriguez Follow",
        starts_at: "2026-08-01T10:00:00.000Z",
        venue: `src="https://www.googletagmanager.com/ns.html?id=GTM-WFBHZX5"`,
        location: "Skip to main content <iframe> UFC",
        source_event_key: "event/ufc-fight-night-august-01-2026",
      },
    );
    const staged = canonicalUfcEventFields(adapted);

    expect(adapted.headliners).toEqual(["Uroš Medić", "Daniel Rodriguez"]);
    expect(adapted.localEventDate).toBe("2026-08-01");
    expect(staged).toMatchObject({
      name: "UFC Fight Night",
      subtitle: "Uroš Medić vs. Daniel Rodriguez",
      venue: "Belgrade Arena",
      location: "Belgrade, Serbia",
      starts_at: "2026-08-01T10:00:00.000Z",
    });
    expect(JSON.stringify(staged)).not.toMatch(/iframe|googletagmanager|skip to main|src=|<|>/i);
  });

  it("rejects polluted or implausibly long venue and location values from final staged metadata", () => {
    const polluted = canonicalUfcEventFields({
      ...ufc,
      venue: `src="https://www.googletagmanager.com/ns.html?id=GTM-WFBHZX5"`,
      city: "Skip to main content <iframe>",
      region: "x".repeat(200),
      country: "<script>Serbia</script>",
    });

    expect(polluted.venue).toBe("");
    expect(polluted.location).toBe("");
    expect(JSON.stringify(polluted)).not.toMatch(/iframe|googletagmanager|skip to main|src=|<|>/i);
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

  it("extracts the real labeled MMA Mania event date, location, and full main-event names", () => {
    const html = readFileSync(resolve(
      process.cwd(),
      "supabase/functions/sync-next-ufc-event/fixtures/medic-rodriguez-fight-night.html",
    ), "utf8");
    const bouts = [
      { section: "main-event", red_fighter_name: "Uroš Medić", blue_fighter_name: "Daniel Rodriguez", weight_class: "Welterweight" },
      { section: "main", red_fighter_name: "Marcin Tybura", blue_fighter_name: "Aleksandar Rakic", weight_class: "Heavyweight" },
      { section: "main", red_fighter_name: "Ante Delija", blue_fighter_name: "Johnny Walker", weight_class: "Heavyweight" },
      { section: "main", red_fighter_name: "Jan Błachowicz", blue_fighter_name: canonicalFighterDisplay("Bogdan Guskov 2"), weight_class: "Light Heavyweight" },
    ];
    const adapted = adaptMmaManiaSource(
      html,
      "https://www.mmamania.com/ufc-fight-cards/446488/latest-ufc-belgrade-fight-card-paramount-start-time-date-and-location-medic-vs-rodriguez-mma",
      bouts,
      ["main-event", "main", "prelim"],
    );

    expect(adapted.explicitEventDates).toEqual(["2026-08-01"]);
    expect(adapted.publicationDates).toEqual(expect.arrayContaining(["2026-06-19T17:48:00+00:00"]));
    expect(adapted.locationSignals.join(" ")).toContain("Belgrade Arena");
    expect(adapted.headliners).toEqual(["Uroš Medić", "Daniel Rodriguez"]);
    expect(adapted.bouts[3].blue_fighter_name).toBe("Bogdan Guskov");
    const result = matchSourceIdentity(ufc, adapted);
    expect(result.accepted).toBe(true);
    expect(result.matchedSignals).toEqual(expect.arrayContaining(["both-headliners", "event-date", "location"]));
  });
});
