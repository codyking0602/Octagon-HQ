import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { matchSourceIdentity, type NormalizedArticleEvent, type NormalizedUfcEvent } from "../../../supabase/functions/sync-next-ufc-event/identityEngine";
import { fighterMatch, normalizeText } from "../../../supabase/functions/sync-next-ufc-event/normalization";
import { adaptMmaManiaSource, adaptUfcSource } from "../../../supabase/functions/sync-next-ufc-event/sourceAdapters";

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
    expect(matchSourceIdentity(ufc, article).accepted).toBe(true);
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

  it("uses official UFC title and description metadata when visible-page fallbacks are polluted", () => {
    const html = `<!doctype html><html><head>
      <title>UFC Fight Night: Medić vs Rodriguez | UFC Belgrade</title>
      <meta property="og:description" content="Don't Miss A Moment Of UFC Fight Night: Medić vs Rodriguez, Live From Belgrade Arena In Belgrade, Serbia On August 1, 2026">
      <script type="application/json">{"page":"event"}</script>
    </head><body><h1>UFC Fight Night</h1><h2>Main navigation</h2></body></html>`;
    const adapted = adaptUfcSource(
      html,
      "https://www.ufc.com/event/ufc-fight-night-august-01-2026",
      {
        name: "UFC Fight Night",
        subtitle: "Bar UFC Fight Pass UFC Video Archive UFC Fight Night Medic vs Rodriguez Follow",
        starts_at: "2026-08-01T10:00:00.000Z",
        venue: "Belgrade Arena, BG Serbia",
        location: "Skip to main content <iframe> UFC",
        source_event_key: "event/ufc-fight-night-august-01-2026",
      },
    );

    expect(adapted.headliners).toEqual(["Medić", "Rodriguez"]);
    expect(adapted.localEventDate).toBe("2026-08-01");
    expect(adapted.venue).toBe("Belgrade Arena");
    expect(adapted.city).toBe("Belgrade");
    expect(adapted.country).toBe("Serbia");
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
      { section: "main", red_fighter_name: "Jan Błachowicz", blue_fighter_name: "Bogdan Guskov 2", weight_class: "Light Heavyweight" },
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
    const result = matchSourceIdentity(ufc, adapted);
    expect(result.accepted).toBe(true);
    expect(result.matchedSignals).toEqual(expect.arrayContaining(["both-headliners", "event-date", "location"]));
  });
});
