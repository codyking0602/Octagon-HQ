import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assertCurrentEventPreview,
  expectedSourceChanges,
} from "../../scripts/event-setup-preview-contract.mjs";

const syncSource = readFileSync(
  "supabase/functions/sync-next-ufc-event/index.ts",
  "utf8",
);
const sourceUrlOwner = readFileSync(
  "supabase/functions/sync-next-ufc-event/sourceUrls.ts",
  "utf8",
);
const cardParserSource = readFileSync(
  "supabase/functions/sync-next-ufc-event/ufcEventParser.ts",
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

const previewNow = new Date("2026-08-18T12:00:00.000Z");

const draft = {
  name: "UFC Fight Night",
  subtitle: "Uroš Medić vs. Daniel Rodriguez",
  venue: "Belgrade Arena",
  location: "Belgrade, Serbia",
  starts_at: "2026-08-22T21:00:00.000Z",
  locks_at: "2026-08-22T21:00:00.000Z",
  source_url: "https://www.mmamania.com/ufc-fight-cards/legacy-card",
  bouts: [bout("main-event-medic-rodriguez", "Uroš Medić", "Daniel Rodriguez")],
};

const currentPreview = {
  name: "UFC Fight Night",
  subtitle: "Anthony Hernandez vs. Gregory Rodrigues",
  venue: "Golden 1 Center",
  location: "Sacramento, California",
  starts_at: "2026-08-23T00:00:00.000Z",
  locks_at: "2026-08-23T00:00:00.000Z",
  source_url: "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
  bouts: [
    bout("main-event-hernandez-rodrigues", "Anthony Hernandez", "Gregory Rodrigues"),
    bout("main-dolidze-de-ridder", "Roman Dolidze", "Reinier de Ridder"),
    bout("main-spivac-petrino", "Serghei Spivac", "Vitor Petrino"),
    bout("main-nzechukwu-gaziev", "Kennedy Nzechukwu", "Shamil Gaziev"),
  ],
};

describe("production Event Setup preview contract", () => {
  it("requires no changes for equivalent timestamps and normalized fighter pairs", () => {
    expect(expectedSourceChanges(draft, {
      ...draft,
      starts_at: "2026-08-22T21:00:00+00:00",
      locks_at: "2026-08-22T21:00:00+00:00",
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

  it("validates the official UFC event source", () => {
    expect(() => assertCurrentEventPreview(
      currentPreview,
      previewNow,
      { requireUfcSource: true },
    )).not.toThrow();
  });

  it("rejects malformed, stale, or non-UFC successful previews on the exact source contract", () => {
    expect(() => assertCurrentEventPreview(
      { ...currentPreview, starts_at: "2026-07-01T00:00:00.000Z" },
      previewNow,
      { requireUfcSource: true },
    )).toThrow("more than one day in the past");
    expect(() => assertCurrentEventPreview(
      { ...currentPreview, bouts: [] },
      previewNow,
      { requireUfcSource: true },
    )).toThrow("implausible");
    expect(() => assertCurrentEventPreview(
      { ...currentPreview, source_url: "https://www.cbssports.com/ufc/event/1/test" },
      previewNow,
      { requireUfcSource: true },
    )).toThrow("specific UFC.com event");
    expect(() => assertCurrentEventPreview(
      { ...currentPreview, source_url: "https://www.mmamania.com/ufc-fight-cards/legacy-card" },
      previewNow,
      { requireUfcSource: true },
    )).toThrow("specific UFC.com event");
  });

  it("checks the deployed source contract before merge and requires UFC once the checked-out head is live", () => {
    const legacyPreview = {
      ...currentPreview,
      source_url: "https://www.cbssports.com/ufc/event/1/legacy-card",
    };
    expect(() => assertCurrentEventPreview(
      legacyPreview,
      previewNow,
      { requireUfcSource: false },
    )).not.toThrow();
    expect(() => assertCurrentEventPreview(
      legacyPreview,
      previewNow,
      { requireUfcSource: true },
    )).toThrow("specific UFC.com event");
    expect(liveVerifier).toContain("const requireUfcSource = expectedSha === sourceSha;");
    expect(liveVerifier).toContain("{ requireUfcSource },");
    expect(liveVerifier).toContain("EVENT_SETUP_TEST_UFC_URL");
    expect(liveVerifier).not.toContain("EVENT_SETUP_TEST_CBS_URL");
  });

  it("keeps UFC.com as the sole operational event metadata and card source", () => {
    expect(syncSource).toMatch(/const UFC_EVENT_INDEX_URL = "https:\/\/www\.ufc\.com\/events(?:\?[^\"]*)?";/);
    expect(syncSource).toContain("parseUfcEventPage");
    expect(syncSource).toContain('source: "UFC.com official event + card"');
    expect(syncSource).not.toMatch(/https?:\/\/(?:www\.)?cbssports\.com/i);
    expect(syncSource).not.toMatch(/https?:\/\/(?:www\.)?mmamania\.com/i);
    expect(cardParserSource).toContain("absoluteUfcEventUrl");
  });

  it("bounds UFC event discovery and parses each official event page once per candidate", () => {
    expect(syncSource).toContain("const MAX_UFC_EVENT_PAGE_ATTEMPTS = 8;");
    expect(syncSource).toContain(".slice(0, MAX_UFC_EVENT_PAGE_ATTEMPTS)");
    expect(syncSource).toContain("for (const candidate of discovered)");
    expect(syncSource).not.toContain("Promise.all(discovered.map");
    expect(syncSource).toContain("parseUfcCandidate(html, candidate.url");
    expect(cardParserSource.match(/export function parseUfcFightCard/g)).toHaveLength(1);
  });

  it("self-heals saved third-party URLs through the canonical source-URL owner", () => {
    expect(syncSource).toContain("resolveUfcSourcePreference");
    expect(sourceUrlOwner).toContain("const suppliedMatchesSaved = Boolean");
    expect(sourceUrlOwner).toContain("isLegacyEventSourceUrl(savedValue)");
    expect(sourceUrlOwner).toContain("const savedUfc = absoluteUfcEventUrl(savedValue);");
    expect(sourceUrlOwner).toMatch(/www\.mmamania\.com/);
    expect(sourceUrlOwner).toMatch(/www\.cbssports\.com/);
    expect(syncSource).not.toContain("fetchExactCbsEvent");
    expect(syncSource).not.toContain("fetchExactMmaManiaEvent");
  });

  it("preserves typed canonical-source failures and keeps the live verifier red with sanitized details", () => {
    expect(syncSource).toContain("if (error instanceof SyncError) throw error;");
    expect(syncSource).toContain('"UFC_EVENT_REJECTED"');
    expect(liveVerifier).toContain("message=${safeMessage(preview.body)}");
    expect(liveVerifier).toContain("details=${safeDetails(preview.body)}");
    expect(liveVerifier).not.toContain('preview.body?.code === "SYNC_UNEXPECTED_ERROR"');
  });
});
