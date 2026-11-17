import { describe, expect, it } from "vitest";
import { matchingStagedEventLocation } from "../../supabase/functions/sync-next-ufc-event/stagedPlace";

const source = {
  source_event_key: "event/ufc-fight-night-november-21-2026",
  source_url: "https://www.ufc.com/event/ufc-fight-night-november-21-2026",
  venue: "ABHA Arena", location: "", starts_at: "2026-11-21T18:00:00Z",
};
const draft = { ...source, state: "staged", location: "Doha, Qatar" };
describe("preserve verified staged UFC event location on source refresh", () => {
  it("reuses only exact same staged event's verified city", () => {
    expect(matchingStagedEventLocation(source, draft)).toBe("Doha, Qatar");
    expect(matchingStagedEventLocation({ ...source, location: "Doha, Qatar" }, draft)).toBe("");
  });
  it("rejects cross-event, old-date, different venue, and polluted fields", () => {
    expect(matchingStagedEventLocation({ ...source, source_event_key: "event/another" }, draft)).toBe("");
    expect(matchingStagedEventLocation({ ...source, source_url: "https://www.ufc.com/event/other" }, draft)).toBe("");
    expect(matchingStagedEventLocation({ ...source, venue: "Another Arena" }, draft)).toBe("");
    expect(matchingStagedEventLocation({ ...source, starts_at: "2026-11-28T18:00:00Z" }, draft)).toBe("");
    expect(matchingStagedEventLocation(source, { ...draft, state: "published" })).toBe("");
    expect(matchingStagedEventLocation(source, { ...draft, location: "<script>bad</script>" })).toBe("");
  });
});
