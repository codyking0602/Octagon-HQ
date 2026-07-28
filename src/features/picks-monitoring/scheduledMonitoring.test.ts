import { describe, expect, it } from "vitest";
import type { MonitoringEvent } from "./manualMonitoringRunner";
import { decideScheduledMonitoring, scheduledMonitoringIntervalMs } from "./scheduledMonitoring";

const now = new Date("2026-08-10T12:00:00Z");
const event = (startsAt: string, locksAt = startsAt): MonitoringEvent => ({
  event_id: "ufc-330",
  source_event_key: "events/ufc-330",
  name: "UFC 330",
  subtitle: "Medic vs. Rodriguez",
  starts_at: startsAt,
  locks_at: locksAt,
  bouts: [{ bout_id: "main-event", red_fighter_name: "Uros Medic", blue_fighter_name: "Daniel Rodriguez" }],
});

describe("scheduled monitoring cadence", () => {
  it("uses low frequency far away and escalates through fight week and event day", () => {
    expect(scheduledMonitoringIntervalMs(event("2026-08-25T12:00:01Z"), now)).toBe(24 * 60 * 60 * 1000);
    expect(scheduledMonitoringIntervalMs(event("2026-08-20T12:00:00Z"), now)).toBe(12 * 60 * 60 * 1000);
    expect(scheduledMonitoringIntervalMs(event("2026-08-15T12:00:00Z"), now)).toBe(6 * 60 * 60 * 1000);
    expect(scheduledMonitoringIntervalMs(event("2026-08-11T18:00:00Z"), now)).toBe(3 * 60 * 60 * 1000);
    expect(scheduledMonitoringIntervalMs(event("2026-08-10T17:00:00Z"), now)).toBe(60 * 60 * 1000);
  });

  it("stops at the earliest canonical Picks lock or event start boundary", () => {
    expect(scheduledMonitoringIntervalMs(event("2026-08-10T17:00:00Z", "2026-08-10T11:00:00Z"), now)).toBe(0);
    expect(decideScheduledMonitoring({ event: event("2026-08-10T17:00:00Z", "2026-08-10T11:00:00Z"), now })).toEqual({ due: false, reason: "monitoring_closed" });
    expect(decideScheduledMonitoring({ event: event("2026-08-10T11:59:59Z"), now })).toEqual({ due: false, reason: "monitoring_closed" });
  });

  it("does not call again before the latest run or reservation is due", () => {
    const monitored = event("2026-08-20T12:00:00Z");
    expect(decideScheduledMonitoring({
      event: monitored,
      now,
      state: { last_completed_at: "2026-08-10T06:30:00Z" },
    })).toEqual({
      due: false,
      reason: "not_due",
      next_eligible_at: "2026-08-10T18:30:00.000Z",
    });
    expect(decideScheduledMonitoring({
      event: monitored,
      now,
      state: { next_eligible_at: "2026-08-10T13:00:00Z" },
    })).toEqual({
      due: false,
      reason: "not_due",
      next_eligible_at: "2026-08-10T13:00:00.000Z",
    });
  });

  it("permits one due call and reserves the next event-aware interval", () => {
    expect(decideScheduledMonitoring({
      event: event("2026-08-10T17:00:00Z"),
      now,
      state: { last_completed_at: "2026-08-10T10:00:00Z" },
    })).toEqual({
      due: true,
      interval_ms: 60 * 60 * 1000,
      next_eligible_at: "2026-08-10T13:00:00.000Z",
    });
  });

  it("protects low or exhausted provider quota until a manual run observes recovery", () => {
    expect(decideScheduledMonitoring({
      event: event("2026-08-20T12:00:00Z"),
      now,
      state: { provider_requests_remaining: 5 },
    })).toEqual({ due: false, reason: "quota_protected" });
    expect(decideScheduledMonitoring({
      event: event("2026-08-20T12:00:00Z"),
      now,
      state: { provider_requests_remaining: 6 },
    }).due).toBe(true);
  });
});
