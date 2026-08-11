import { describe, expect, it } from "vitest";
import { parseMmaManiaEventMetadata } from "../../supabase/functions/sync-next-ufc-event/mmaManiaEventMetadata.ts";

const mainEvent = {
  red_fighter_name: "Islam Makhachev",
  blue_fighter_name: "Ian Machado Garry",
};

describe("numbered UFC event start time", () => {
  it("uses the prelim start as the event start and Picks lock for PPVs", () => {
    const metadata = parseMmaManiaEventMetadata({
      sourceUrl: "https://www.mmamania.com/ufc-fight-cards/451594/ufc-330-fight-card",
      articleText: "Event: UFC 330 Date: 2026-08-15 Location: Xfinity Mobile Arena in Philadelphia, Pennsylvania Start times: Prelims 8 P.M. ET | Main Card 10 P.M. ET Broadcast: ESPN",
      mainEvent,
    });

    expect(metadata.eventType).toBe("numbered");
    expect(metadata.prelims_starts_at).toBe("2026-08-16T00:00:00.000Z");
    expect(metadata.starts_at).toBe(metadata.prelims_starts_at);
    expect(metadata.locks_at).toBe(metadata.prelims_starts_at);
  });

  it("keeps Fight Night event start ownership on its main-card time", () => {
    const metadata = parseMmaManiaEventMetadata({
      sourceUrl: "https://www.mmamania.com/ufc-fight-cards/example-fight-night",
      articleText: "Event: UFC Fight Night Date: 2026-08-22 Location: UFC Apex in Las Vegas, Nevada Start times: Main Card 7 P.M. ET Broadcast: ESPN",
      mainEvent,
    });

    expect(metadata.eventType).toBe("fight-night");
    expect(metadata.starts_at).toBe("2026-08-22T23:00:00.000Z");
    expect(metadata.prelims_starts_at).toBe("");
  });
});
