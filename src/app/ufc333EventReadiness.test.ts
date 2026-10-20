import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { shaneContenderForSlug } from "../features/picks/ShaneContenderSpotlight";
import { getUfcStatsSnapshotFighter } from "../../supabase/functions/build-pick-spotlight/ufcStatsSnapshot";
import { buildPickSpotlightContent } from "../features/picks/spotlightContent";
import { reviewedOfficialUfcEventBanner } from "../features/picks/ufcMmaManiaPoster";
import type { PickEvent } from "../features/picks/picksModel";

const migration = readFileSync("supabase/migrations/202612310303_ufc333_event_readiness.sql", "utf8");
describe("UFC 333 fight-week readiness", () => {
  it("guards source-verified emergency odds without clobbering canonical monitoring", () => {
    expect(migration.match(/UPDATE public.pick_bouts b SET/g)).toHaveLength(3);
    expect(migration.match(/b.red_american_odds IS NULL AND b.blue_american_odds IS NULL/g)).toHaveLength(3);
    expect(migration).toContain("private.pick_event_spotlight_is_valid");
    expect(migration).toContain("v_spotlights");
    expect(migration).toContain("odds_source = 'UFC.com'");
    expect(migration).toContain("red_american_odds = -110, blue_american_odds = -110");
    expect(migration).toContain("red_american_odds = -105, blue_american_odds = -115");
    expect(migration).toContain("red_american_odds = -120, blue_american_odds = 100");
  });
  it("recognizes Shane's prospect regardless of official UFC slug variant", () => {
    expect(shaneContenderForSlug("abdulrakhman-yakhyaev")?.rank).toBe(3);
    expect(shaneContenderForSlug("abdul-rakhman-yakhyaev")?.rank).toBe(3);
  });
  it("has verified biographical data and actual editorial analysis for both special matchups", () => {
    for (const [name,slug] of [
      ["Petr Yan","petr-yan"], ["Merab Dvalishvili","merab-dvalishvili"],
      ["Nikita Krylov","nikita-krylov"], ["Abdul Rakhman Yakhyaev","abdulrakhman-yakhyaev"],
    ]) {
      expect(getUfcStatsSnapshotFighter(name)?.record).toMatch(/^\\d+-\\d+-/);
      expect(migration).toContain(slug);
    }
    const red = getUfcStatsSnapshotFighter("Petr Yan")!;
    const blue = getUfcStatsSnapshotFighter("Merab Dvalishvili")!;
    const actual = buildPickSpotlightContent({
      boutId: "main-petr-yan-merab-dvalishvili", eventStartsAt: "2026-10-24T18:00:00Z",
      red: {...red, fighterSlug:"petr-yan"},
      blue: {...blue, fighterSlug:"merab-dvalishvili"},
    });
    expect(actual.preview).toContain("2023");
    expect(actual.preview).toContain("UFC 323");
    expect(actual.red.edges).toHaveLength(3);
    expect(actual.blue.edges).toHaveLength(3);
    expect(actual.preview).not.toContain("stay adaptable");
  });
  it("uses official partner artwork only when MMA Mania has no verified poster", () => {
    const event = {
      name: "UFC 333", subtitle: "Alexander Volkanovski vs. Movsar Evloev",
      startsAt: "2026-10-24T18:00:00Z", sport: "mma",
    } as PickEvent;
    expect(reviewedOfficialUfcEventBanner(event)?.src).toContain("visitabudhabi.ae");
    expect(reviewedOfficialUfcEventBanner({...event, name:"UFC 334"})).toBeNull();
  });
});
