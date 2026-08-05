import { describe, expect, it } from "vitest";
import { resolveMonitoringEvent } from "./manualMonitoringRunner";

const event = {
  event_id: "published-id",
  source_event_key: "events/ufc-fight-night",
  name: "UFC Fight Night",
  subtitle: "Alpha vs. Beta",
  starts_at: "2099-08-15T22:00:00.000Z",
  locks_at: "2099-08-15T21:00:00.000Z",
  bouts: [{
    bout_id: "main-event-alpha-beta",
    red_fighter_slug: "alpha",
    red_fighter_name: "Alpha",
    blue_fighter_slug: "beta",
    blue_fighter_name: "Beta",
  }],
};

describe("monitoring event identity", () => {
  it("allows a changed headliner on the same named source event", () => {
    expect(() => resolveMonitoringEvent({
      ...event,
      event_id: "draft-id",
      subtitle: "Alpha vs. Replacement",
      starts_at: "2099-08-15T23:00:00.000Z",
    }, event)).not.toThrow();
  });

  it("rejects a conflicting event name even when a stale source key is reused", () => {
    expect(() => resolveMonitoringEvent({
      ...event,
      event_id: "draft-id",
      name: "UFC 400",
      subtitle: "Other vs. Event",
    }, event)).toThrow(/identities conflict/i);
  });
});
