import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { hasSourceIdentityConflict } from "../../supabase/functions/sync-next-ufc-event/identityEngine";
import {
  assertCurrentEventPreview,
  assertSafeEventSourceRollover,
  expectedSourceChanges,
} from "../../scripts/event-setup-preview-contract.mjs";

const syncSource = readFileSync(
  "supabase/functions/sync-next-ufc-event/index.ts",
  "utf8",
);
const cardParserSource = readFileSync(
  "supabase/functions/sync-next-ufc-event/cbsSportsEventParser.ts",
  "utf8",
);
const liveVerifier = readFileSync(
  "scripts/verify-event-setup-preview-live.mjs",
  "utf8",
);

const bout = (bout_id: string, red_fighter_name: string, blue_fighter_name: string) => ({
  bout_id,
  red_fighter_name,
  blue_fighter_name,
  weight_class: "Heavyweight",
});

const previewNow = new Date("2026-08-02T00:00:00.000Z");

const draft = {
  name: "UFC Fight Night",
  subtitle: "Uroš Medić vs. Daniel Rodriguez",
  venue: "Belgrade Arena",
  location: "Belgrade, Serbia",
  starts_at: "2026-08-01T19:00:00+00:00",
  locks_at: "2026-08-01T19:00:00+00:00",
  source_url: "https://example.com/card",
  bouts: [bout("main-event-medic-rodriguez", "Uroš Medić", "Daniel Rodriguez")],
};

const currentPreview = {
  name: "UFC Fight Night",
  subtitle: "Mateusz Gamrot vs. Quillan Salkilld",
  venue: "Meta APEX",
  location: "Las Vegas, NV, United States",
  starts_at: "2026-08-08T21:00:00.000Z",
  locks_at: "2026-08-08T21:00:00.000Z",
  source_url: "https://www.cbssports.com/ufc/event/31009998/ufc-fight-night-gamrot-vs-salkilld-august-8-2026/",
  bouts: [
    bout("main-event-gamrot-salkilld", "Mateusz Gamrot", "Quillan Salkilld"),
    bout("main-nurgozhay-lopes", "Diyar Nurgozhay", "Bruno Lopes"),
    bout("main-ferreira-quarantillo", "Diego Ferreira", "Billy Quarantillo"),
    bout("main-sutherland-silva", "Louie Sutherland", "Jose Montanha da Silva"),
  ],
};

describe("production Event Setup preview contract", () => {
  it("requires no changes for equivalent timestamps and normalized fighter pairs", () => {
    expect(expectedSourceChanges(draft, {
      ...draft,
      starts_at: "2026-08-01T19:00:00.000Z",
      locks_at: "2026-08-01T19:00:00.000Z",
      bouts: [bout("main-event-rodriguez-medic", "Daniel Rodriguez", "Uros Medic")],
    })).toEqual([]);
  });

  it("requires the exact canonical staging summary when Event Setup has no draft", () => {
    expect(expectedSourceChanges(null as unknown as typeof draft, currentPreview)).toEqual([
      "Stage a new main card with 4 fights.",
    ]);
  });

  it("accepts only the real membership and order changes in an updated card", () => {
    const second = bout("main-tybura-rakic", "Marcin Tybura", "Aleksandar Rakić");
    const third = bout("main-delija-walker", "Ante Delija", "Johnny Walker");

    expect(expectedSourceChanges(
      { ...draft, bouts: [draft.bouts[0], second] },
      { ...draft, bouts: [second, draft.bouts[0], third] },
    )).toEqual([
      "Added main card: Ante Delija vs. Johnny Walker.",
      "Fight order changed.",
    ]);
  });

  it("validates whichever current event the canonical sources return", () => {
    expect(() => assertCurrentEventPreview(currentPreview, previewNow)).not.toThrow();
  });

  it("rejects malformed or stale successful previews", () => {
    expect(() => assertCurrentEventPreview(
      { ...currentPreview, starts_at: "2026-07-01T00:00:00.000Z" },
      previewNow,
    )).toThrow("more than one day in the past");
    expect(() => assertCurrentEventPreview(
      { ...currentPreview, bouts: [] },
      previewNow,
    )).toThrow("implausible");
    expect(() => assertCurrentEventPreview(
      { ...currentPreview, source_url: "/picks" },
      previewNow,
    )).toThrow("specific CBS Sports UFC event");
  });

  it("checks the deployed source contract before merge and requires CBS once the checked-out head is live", () => {
    const legacyPreview = {
      ...currentPreview,
      source_url: "https://www.mmamania.com/ufc-fight-cards/legacy-card",
    };
    expect(() => assertCurrentEventPreview(
      legacyPreview,
      previewNow,
      { requireCbsSource: false },
    )).not.toThrow();
    expect(() => assertCurrentEventPreview(legacyPreview, previewNow))
      .toThrow("specific CBS Sports UFC event");
    expect(liveVerifier).toContain("const requireCbsSource = expectedSha === sourceSha;");
    expect(liveVerifier).toContain("{ requireCbsSource },");
    expect(liveVerifier).not.toContain("EVENT_SETUP_TEST_MMA_URL");
  });

  it("accepts only a structured fail-closed source rollover", () => {
    expect(() => assertSafeEventSourceRollover({
      code: "ARTICLE_IDENTITY_REJECTED",
      stage: "identity-match",
      safeDetails: {
        conflicts: ["Headliners do not match."],
        normalizedUfcEvent: {
          headliners: ["mateusz gamrot", "quillan salkilld"],
          eventDate: "2026-08-08",
          location: "las vegas united states",
        },
        normalizedArticleEvent: {
          headliners: ["uros medic", "daniel rodriguez"],
          eventDate: "2026-08-01",
          location: "belgrade serbia",
        },
      },
    })).not.toThrow();

    expect(() => assertSafeEventSourceRollover({
      code: "UPSTREAM_HTTP_ERROR",
      stage: "cbs-fetch",
      safeDetails: {},
    })).toThrow("Expected a safe article identity rejection");
  });

  it("distinguishes a real source rollover from card-shape failure alone", () => {
    expect(hasSourceIdentityConflict({ conflicts: ["implausible-or-unsectioned-card"] })).toBe(false);
    expect(hasSourceIdentityConflict({ conflicts: ["implausible-or-unsectioned-card", "event-date:2026-08-01!=2026-08-08"] })).toBe(true);
    expect(hasSourceIdentityConflict({ conflicts: ["neither-headliner-matches"] })).toBe(true);
  });

  it("keeps CBS Sports as the sole operational event metadata and card source", () => {
    expect(syncSource).toContain('const CBS_UFC_SCHEDULE_URL = "https://www.cbssports.com/ufc/schedule/";');
    expect(syncSource).toContain("parseCbsSportsEventPage");
    expect(syncSource).toContain('source: "CBS Sports UFC event + card"');
    expect(syncSource).not.toMatch(/https?:\/\/(?:www\.)?ufc\.com/i);
    expect(syncSource).not.toMatch(/https?:\/\/(?:www\.)?mmamania\.com/i);
  });

  it("bounds CBS event discovery and parses each event page only once", () => {
    expect(syncSource).toContain("const MAX_CBS_EVENT_PAGE_ATTEMPTS = 6;");
    expect(syncSource).toContain(".slice(0, MAX_CBS_EVENT_PAGE_ATTEMPTS)");
    expect(syncSource).toContain("for (const candidate of discovered)");
    expect(syncSource).not.toContain("Promise.all(discovered.map");
    expect(syncSource).toContain("parseCbsEventCandidate(html, candidate.url, sourceEventKeyOverride)");
    expect(cardParserSource.match(/function parseCbsSportsCard/g)).toHaveLength(1);
  });

  it("preserves typed canonical-source failures and keeps the live verifier red with sanitized details", () => {
    expect(syncSource).toContain("if (error instanceof SyncError) throw error;");
    expect(syncSource).toContain('"CBS_EVENT_REJECTED"');
    expect(liveVerifier).toContain("message=${safeMessage(preview.body)}");
    expect(liveVerifier).toContain("details=${safeDetails(preview.body)}");
    expect(liveVerifier).not.toContain('preview.body?.code === "SYNC_UNEXPECTED_ERROR"');
  });
});
