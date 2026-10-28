import { describe, expect, it } from "vitest";
import {
  compareUfcPrepToSource,
  effectiveUfcPrepStatus,
  mapUfcPickPrep,
  prepAssetSummary,
  preparedMainEventSpotlight,
} from "./ufcPrepModel";

const prepPayload = {
  prep_id: "11111111-1111-4111-8111-111111111111",
  source_event_key: "ufc-test",
  source_url: "https://www.ufc.com/event/ufc-test",
  event_id: "ufc-test",
  event_name: "UFC Test",
  event_kind: "numbered",
  card_scope: "main-prelims",
  starts_at: "2026-09-26T23:00:00Z",
  status: "ready",
  prepared_at: "2026-09-21T13:00:00Z",
  verified_at: "2026-09-21T13:00:00Z",
  updated_at: "2026-09-21T13:00:00Z",
  verification_notes: [],
  bouts: [
    {
      bout_id: "main-event-alpha-beta",
      position: 1,
      section: "main-event",
      weight_class: "Lightweight",
      red_fighter_slug: "alpha",
      red_fighter_name: "Alpha One",
      blue_fighter_slug: "beta",
      blue_fighter_name: "Beta Two",
    },
    {
      bout_id: "main-gamma-delta",
      position: 2,
      section: "main",
      weight_class: "Welterweight",
      red_fighter_slug: "gamma",
      red_fighter_name: "Gamma Three",
      blue_fighter_slug: "delta",
      blue_fighter_name: "Delta Four",
    },
  ],
  spotlights: [{
    bout_id: "main-event-alpha-beta",
    preview: "Alpha wants a pressure wrestling fight and relies on chain takedowns to dictate the exchanges. Beta needs to maintain distance and use clean southpaw counters to keep Alpha from getting close. The tactical battle should center on whether Alpha can force the clinch before Beta establishes the jab.",
    red: { fighter_slug: "alpha", record: "10-1", age: "29", height: "6'0\"", reach: "74\"", stance: "Orthodox", edges: ["Chain wrestling", "Forward pressure", "Clinch control"] },
    blue: { fighter_slug: "beta", record: "12-2", age: "31", height: "5'11\"", reach: "72\"", stance: "Southpaw", edges: ["Southpaw counters", "Range management", "Jab timing"] },
    watch_spotlights: [],
    source: "UFCStats",
    generated_at: "2026-09-21T13:00:00Z",
  }],
  assets: [
    { fighter_slug: "alpha", fighter_name: "Alpha One", thumb_ready: true, spotlight_ready: true, thumb_path: "/assets/fighters/alpha-thumb.webp", spotlight_path: "/assets/fighters/alpha-spotlight.webp" },
    { fighter_slug: "beta", fighter_name: "Beta Two", thumb_ready: true, spotlight_ready: true, thumb_path: "/assets/fighters/beta-thumb.webp", spotlight_path: "/assets/fighters/beta-spotlight.webp" },
    { fighter_slug: "gamma", fighter_name: "Gamma Three", thumb_ready: true, spotlight_ready: false, thumb_path: "/assets/fighters/gamma-thumb.webp", spotlight_path: "" },
    { fighter_slug: "delta", fighter_name: "Delta Four", thumb_ready: true, spotlight_ready: false, thumb_path: "/assets/fighters/delta-thumb.webp", spotlight_path: "" },
  ],
};

describe("UFC Picks prep", () => {
  it("rejects free-form research citations in the reserved machine source field", () => {
    expect(() => mapUfcPickPrep({
      ...prepPayload,
      spotlights: [{ ...prepPayload.spotlights[0], source: "UFC.com profiles; MMA preview" }],
    })).toThrow();
    expect(mapUfcPickPrep(prepPayload)?.spotlights[0]?.source).toBe("UFCStats");
  });

  it("maps the owner-only prep payload and summarizes assets", () => {
    const prep = mapUfcPickPrep(prepPayload);
    expect(prep?.eventKind).toBe("numbered");
    expect(prep?.cardScope).toBe("main-prelims");
    expect(prepAssetSummary(prep)).toEqual({
      thumbReady: 4,
      thumbTotal: 4,
      requiredSpotlightReady: 2,
      requiredSpotlightTotal: 2,
      optionalSpotlightReady: 0,
      optionalSpotlightTotal: 2,
      previewReady: 1,
      previewTotal: 2,
    });
  });


  it("does not count previews for a nonmatching bout identity, and keeps missing photos pending", () => {
    const value = {
      ...prepPayload,
      spotlights: [{ ...prepPayload.spotlights[0], red: { ...prepPayload.spotlights[0].red, fighter_slug: "wrong-fighter" } }],
      assets: prepPayload.assets.map((asset) => ({ ...asset, spotlight_ready: false })),
    };
    expect(prepAssetSummary(mapUfcPickPrep(value))).toMatchObject({
      requiredSpotlightReady: 0,
      requiredSpotlightTotal: 2,
      previewReady: 0,
      previewTotal: 2,
    });
  });

  it("downgrades premature ready status when required photos or card previews are absent", () => {
    expect(effectiveUfcPrepStatus(mapUfcPickPrep(prepPayload))).toBe("review-needed");
    const complete = {
      ...prepPayload,
      spotlights: prepPayload.spotlights.concat({
        ...prepPayload.spotlights[0],
        bout_id: "main-gamma-delta",
        red: { ...prepPayload.spotlights[0].red, fighter_slug: "gamma" },
        blue: { ...prepPayload.spotlights[0].blue, fighter_slug: "delta" },
      }),
    };
    expect(effectiveUfcPrepStatus(mapUfcPickPrep(complete))).toBe("ready");
    expect(effectiveUfcPrepStatus(mapUfcPickPrep({ ...complete, status: "blocked" }))).toBe("blocked");
  });

  it("accepts null asset paths for legitimately missing prep assets", () => {
    const value = {
      ...prepPayload,
      assets: prepPayload.assets.map((asset, index) => (
        index === 2
          ? { ...asset, thumb_path: null, spotlight_path: null }
          : asset
      )),
    };

    const prep = mapUfcPickPrep(value)!;
    expect(prep.assets[2].thumbPath).toBe("");
    expect(prep.assets[2].spotlightPath).toBe("");
  });

  it("finds the prepared main-event spotlight only for the matching staged bout", () => {
    const prep = mapUfcPickPrep(prepPayload)!;
    const spotlight = preparedMainEventSpotlight(prep, [{
      boutId: "main-event-alpha-beta",
      position: 1,
      weightClass: "Lightweight",
      redFighterSlug: "alpha",
      redFighterName: "Alpha One",
      blueFighterSlug: "beta",
      blueFighterName: "Beta Two",
      included: true,
    }]);
    expect(spotlight?.boutId).toBe("main-event-alpha-beta");
  });

  it("reports card drift without treating a clean card as changed", () => {
    const prep = mapUfcPickPrep(prepPayload)!;
    const cleanPreview = {
      sourceHash: "hash",
      requestedScope: "auto" as const,
      effectiveScope: "full" as const,
      source: "ufc.com",
      sourceUrl: prep.sourceUrl,
      fightCount: 2,
      changes: [],
      warnings: [],
      event: {
        name: "UFC Test",
        subtitle: "",
        venue: "Arena",
        location: "City",
        startsAt: prep.startsAt,
        locksAt: prep.startsAt,
        bouts: prep.bouts.map((bout) => ({
          boutId: bout.boutId,
          position: bout.position,
          weightClass: bout.weightClass,
          redFighterSlug: bout.redFighterSlug,
          redFighterName: bout.redFighterName,
          blueFighterSlug: bout.blueFighterSlug,
          blueFighterName: bout.blueFighterName,
          included: true,
        })),
      },
    };
    expect(compareUfcPrepToSource(prep, cleanPreview)).toEqual([]);

    const changedPreview = {
      ...cleanPreview,
      event: {
        ...cleanPreview.event,
        bouts: cleanPreview.event.bouts.slice(0, 1).concat({
          boutId: "main-epsilon-zeta",
          position: 2,
          weightClass: "Welterweight",
          redFighterSlug: "epsilon",
          redFighterName: "Epsilon Five",
          blueFighterSlug: "zeta",
          blueFighterName: "Zeta Six",
          included: true,
        }),
      },
    };
    expect(compareUfcPrepToSource(prep, changedPreview)).toEqual([
      "REMOVED SINCE PREP: Gamma Three vs. Delta Four",
      "ADDED SINCE PREP: Epsilon Five vs. Zeta Six",
    ]);
  });
});
