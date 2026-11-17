import { describe, expect, it } from "vitest";
import { selectPreparedPickSpotlight } from "../../supabase/functions/build-pick-spotlight/preparedSpotlight";

const source = {
  source_event_key: "event/ufc-fight-night-november-21-2026",
  source_url: "https://www.ufc.com/event/ufc-fight-night-november-21-2026",
  starts_at: "2026-11-21T18:00:00Z",
  name: "UFC Fight Night",
};
const bout = { bout_id: "main-event-jiri-prochazka-navajo-stirling", red_fighter_slug: "jiri-prochazka", blue_fighter_slug: "navajo-stirling" };
const prepared = {
  starts_at: source.starts_at, source_event_key: source.source_event_key, source_url: source.source_url,
  payload: { spotlights: [{
    bout_id: "ufc-fight-night-2026-11-21-jiri-prochazka-vs-navajo-stirling",
    source: "UFCStats", preview: "Prochazka brings pressure while Stirling needs to maintain distance and avoid chaotic exchanges.",
    generated_at: "2026-11-15T12:00:00Z",
    red: { fighter_slug: "jiri-prochazka" }, blue: { fighter_slug: "navajo-stirling" },
  }] },
};
describe("prepared Fight Night Spotlight reuse", () => {
  it("matches the verified event and corner identities despite canonical bout ID changes", () => {
    expect(selectPreparedPickSpotlight([prepared], source, bout)?.bout_id)
      .toBe("ufc-fight-night-2026-11-21-jiri-prochazka-vs-navajo-stirling");
  });
  it("fails closed on a changed source, date, opponent, or ambiguous prep", () => {
    expect(selectPreparedPickSpotlight([prepared], { ...source, source_event_key: "event/other" }, bout)).toBeNull();
    expect(selectPreparedPickSpotlight([prepared], { ...source, starts_at: "2026-11-28T18:00:00Z" }, bout)).toBeNull();
    expect(selectPreparedPickSpotlight([prepared], source, { ...bout, blue_fighter_slug: "other" })).toBeNull();
    expect(selectPreparedPickSpotlight([prepared, prepared], source, bout)).toBeNull();
  });
  it("also reuses uniquely verified numbered prep when published control has no source key", () => {
    const numbered = { ...prepared, source_event_key: "event/ufc-334", source_url: "https://www.ufc.com/event/ufc-334" };
    expect(selectPreparedPickSpotlight([numbered], { starts_at: source.starts_at, name: "UFC 334" }, bout)).not.toBeNull();
  });
});
