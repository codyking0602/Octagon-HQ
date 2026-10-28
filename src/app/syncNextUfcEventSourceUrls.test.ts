import { describe, expect, it } from "vitest";
import {
  absoluteUfcEventUrl,
  absoluteUfcEventsUrl,
  canonicalUfcEventKey,
  resolveUfcSourcePreference,
} from "../../supabase/functions/sync-next-ufc-event/sourceUrls";

describe("sync-next-ufc-event official UFC source URLs", () => {
  it("accepts only official UFC event and event-index URLs", () => {
    expect(absoluteUfcEventUrl("https://www.ufc.com/event/ufc-fight-night-august-22-2026"))
      .toBe("https://www.ufc.com/event/ufc-fight-night-august-22-2026");
    expect(absoluteUfcEventUrl("https://ufc.com/event/ufc-fight-night-august-22-2026"))
      .toBe("https://www.ufc.com/event/ufc-fight-night-august-22-2026");
    expect(absoluteUfcEventsUrl("https://www.ufc.com/events?page=1&junk=yes"))
      .toBe("https://www.ufc.com/events?page=1");
    expect(absoluteUfcEventUrl("https://www.cbssports.com/ufc/event/1/test")).toBe("");
    expect(absoluteUfcEventUrl("https://www.mmamania.com/ufc-fight-cards/test")).toBe("");
    expect(canonicalUfcEventKey("https://www.ufc.com/event/ufc-fight-night-august-22-2026"))
      .toBe("event/ufc-fight-night-august-22-2026");
  });

  it("self-heals persisted third-party URLs while rejecting newly supplied third-party URLs", () => {
    const legacy = "https://www.mmamania.com/ufc-fight-cards/legacy-card";
    expect(resolveUfcSourcePreference(legacy, legacy)).toEqual({
      invalidExplicitSource: false,
      preferredSourceUrl: "",
      suppliedMatchesSaved: true,
    });
    expect(resolveUfcSourcePreference("", legacy)).toEqual({
      invalidExplicitSource: false,
      preferredSourceUrl: "",
      suppliedMatchesSaved: false,
    });
    expect(resolveUfcSourcePreference("https://www.cbssports.com/ufc/event/1/test", ""))
      .toMatchObject({ invalidExplicitSource: true, preferredSourceUrl: "" });
  });
});
