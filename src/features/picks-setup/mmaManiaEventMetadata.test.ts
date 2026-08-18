import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseMmaManiaEventMetadata } from "../../../supabase/functions/sync-next-ufc-event/mmaManiaEventMetadata";

const vegasSource = "https://www.mmamania.com/ufc-fight-cards/458904/ufc-vegas-120-fight-card-start-time-date-location-gamrot-vs-salkilld-mma";

describe("MMA Mania event metadata", () => {
  it("derives the current Fight Night identity, place, and main-card time without UFC.com", () => {
    const articleTail = ` UFC Vegas 120 Main Event On Paramount+: 155 lbs.: Mateusz Gamrot vs. Quillan Salkilld UFC Vegas 120 Main Card on Paramount+ (8 p.m. ET): 155 lbs.: Billy Quarantillo vs. Diego Ferreira ${"updated fight card detail ".repeat(30)}`;
    const metadata = parseMmaManiaEventMetadata({
      sourceUrl: vegasSource,
      articleText: `Event: UFC Vegas 120: Gamrot vs. SalkilldDate: Sat., Aug. 8, 2026Location: Meta APEX in Las Vegas, NevadaBroadcast: Paramount+Start Time: 5 p.m. ET Prelims Card | 8 p.m. ET Main Card${articleTail}`,
      mainEvent: {
        red_fighter_name: "Mateusz Gamrot",
        blue_fighter_name: "Quillan Salkilld",
      },
    });

    expect(metadata).toMatchObject({
      name: "UFC Fight Night",
      subtitle: "Mateusz Gamrot vs. Quillan Salkilld",
      venue: "Meta APEX",
      location: "Las Vegas, Nevada",
      starts_at: "2026-08-09T00:00:00.000Z",
      prelims_starts_at: "",
      locks_at: "2026-08-09T00:00:00.000Z",
      season: 2026,
      eventType: "fight-night",
      localEventDate: "2026-08-08",
    });
    expect(metadata.source_event_key).toBe("ufc-fight-cards/458904/ufc-vegas-120-fight-card-start-time-date-location-gamrot-vs-salkilld-mma");
  });

  it("derives numbered-event prelim and main-card times from MMA Mania", () => {
    const metadata = parseMmaManiaEventMetadata({
      sourceUrl: "https://www.mmamania.com/ufc-fight-cards/ufc-330-makhachev-vs-machado-garry",
      articleText: "Event: UFC 330: Makhachev vs. Machado Garry Date: Sat., Aug. 15, 2026 Location: Xfinity Mobile Arena, Philadelphia, Pennsylvania Start times: Prelims Card Start Time at 6 p.m. ET | Main Card Start Time at 9 p.m. ET",
      mainEvent: {
        red_fighter_name: "Islam Makhachev",
        blue_fighter_name: "Ian Machado Garry",
      },
    });

    expect(metadata).toMatchObject({
      name: "UFC 330",
      subtitle: "Islam Makhachev vs. Ian Machado Garry",
      venue: "Xfinity Mobile Arena",
      location: "Philadelphia, Pennsylvania",
      starts_at: "2026-08-15T22:00:00.000Z",
      prelims_starts_at: "2026-08-15T22:00:00.000Z",
      locks_at: "2026-08-15T22:00:00.000Z",
      eventType: "numbered",
      localEventDate: "2026-08-15",
    });
  });

  it("preserves the published source-event key during monitoring of an existing card", () => {
    const metadata = parseMmaManiaEventMetadata({
      sourceUrl: vegasSource,
      articleText: "Event: UFC Vegas 120: Gamrot vs. Salkilld Date: Sat., Aug. 8, 2026 Location: Meta APEX in Las Vegas, Nevada Start Time: 5 p.m. ET Prelims Card | 8 p.m. ET Main Card",
      mainEvent: {
        red_fighter_name: "Mateusz Gamrot",
        blue_fighter_name: "Quillan Salkilld",
      },
      sourceEventKeyOverride: "event/legacy-published-card",
    });

    expect(metadata.source_event_key).toBe("event/legacy-published-card");
  });

  it("fails closed when MMA Mania does not supply explicit event date or card time evidence", () => {
    expect(() => parseMmaManiaEventMetadata({
      sourceUrl: vegasSource,
      articleText: "Event: UFC Vegas 120: Gamrot vs. Salkilld Location: Meta APEX in Las Vegas, Nevada",
      mainEvent: {
        red_fighter_name: "Mateusz Gamrot",
        blue_fighter_name: "Quillan Salkilld",
      },
    })).toThrow("one explicit event date");

    expect(() => parseMmaManiaEventMetadata({
      sourceUrl: "https://www.mmamania.com/ufc-fight-cards/458904/ufc-vegas-120-start-time-8-pm-et",
      articleText: "Event: UFC Vegas 120: Gamrot vs. Salkilld Date: Sat., Aug. 8, 2026 Location: Meta APEX in Las Vegas, Nevada",
      mainEvent: {
        red_fighter_name: "Mateusz Gamrot",
        blue_fighter_name: "Quillan Salkilld",
      },
    })).toThrow("labeled card start times");
  });

  it("keeps legacy MMA parsing isolated from the UFC.com-only runtime owner", () => {
    const syncFunction = readFileSync("supabase/functions/sync-next-ufc-event/index.ts", "utf8");
    const monitoringFunction = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");

    expect(syncFunction).toMatch(/const UFC_EVENT_INDEX_URL = "https:\/\/www\.ufc\.com\/events(?:\?[^\"]*)?";/);
    expect(syncFunction).toContain("parseUfcEventPage");
    expect(syncFunction).toContain('source: "UFC.com event + card"');
    expect(syncFunction).not.toContain("parseMmaManiaEventMetadata");
    expect(syncFunction).not.toMatch(/https?:\/\/(?:www\.)?mmamania\.com/i);
    expect(syncFunction).not.toContain("parseCbsSportsEventPage");
    expect(syncFunction).not.toMatch(/https?:\/\/(?:www\.)?cbssports\.com/i);
    expect(monitoringFunction).toContain("...(sourceEventKey ? { source_event_key: sourceEventKey } : {})");
  });
});
