import type { MonitoringEvent } from "./manualMonitoringRunner";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const AUTOMATIC_STAGE_MAX_LEAD_MS = 6 * DAY_MS;
const AUTOMATIC_STAGE_HOURS = new Set([8, 12, 16, 20]);

export type ScheduledMonitoringSkipReason =
  | "monitoring_closed"
  | "invalid_event_time"
  | "not_due"
  | "quota_protected";

export interface ScheduledMonitoringState {
  last_completed_at?: string | null;
  next_eligible_at?: string | null;
  provider_requests_remaining?: number | null;
}

export type ScheduledMonitoringDecision =
  | {
      due: true;
      interval_ms: number;
      next_eligible_at: string;
    }
  | {
      due: false;
      reason: ScheduledMonitoringSkipReason;
      next_eligible_at?: string;
    };

function parsedTime(value: string | null | undefined) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function centralWeekdayAndHour(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);
  return {
    weekday: parts.find((part) => part.type === "weekday")?.value ?? "",
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? Number.NaN),
  };
}

/**
 * The one hourly monitoring wake may attempt Event Setup discovery four times on
 * Monday and Tuesday of fight week. This bounds upstream discovery while still
 * allowing a later article publication or a transient morning failure to recover.
 */
export function shouldAttemptAutomaticEventStaging(now: Date) {
  const central = centralWeekdayAndHour(now);
  return (central.weekday === "Mon" || central.weekday === "Tue")
    && AUTOMATIC_STAGE_HOURS.has(central.hour);
}

/**
 * Automatic staging is only allowed for the next event when it is truly inside
 * the upcoming fight-week horizon. Events farther out remain manual/un-staged.
 */
export function eventIsInAutomaticStagingWindow(startsAt: string | null | undefined, now: Date) {
  const startsAtMs = parsedTime(startsAt);
  if (startsAtMs === null) return false;
  const lead = startsAtMs - now.getTime();
  return lead > 0 && lead <= AUTOMATIC_STAGE_MAX_LEAD_MS;
}

/**
 * Provider cadence is based on canonical server-owned event and lock timestamps.
 * The hourly scheduler may wake up more often than this function allows a provider call.
 */
export function scheduledMonitoringIntervalMs(event: MonitoringEvent, now: Date) {
  const startsAt = parsedTime(event.starts_at);
  const locksAt = parsedTime(event.locks_at);
  if (startsAt === null || locksAt === null) return null;

  const nowMs = now.getTime();
  const monitoringStopsAt = Math.min(startsAt, locksAt);
  if (monitoringStopsAt <= nowMs) return 0;

  const remaining = monitoringStopsAt - nowMs;
  if (remaining > 14 * DAY_MS) return 24 * HOUR_MS;
  if (remaining > 2 * DAY_MS) return 12 * HOUR_MS;
  if (remaining > 12 * HOUR_MS) return 3 * HOUR_MS;
  return HOUR_MS;
}

export function decideScheduledMonitoring(input: {
  event: MonitoringEvent;
  now: Date;
  state?: ScheduledMonitoringState | null;
}): ScheduledMonitoringDecision {
  const interval = scheduledMonitoringIntervalMs(input.event, input.now);
  if (interval === null) return { due: false, reason: "invalid_event_time" };
  if (interval === 0) return { due: false, reason: "monitoring_closed" };

  const remaining = input.state?.provider_requests_remaining;
  if (typeof remaining === "number" && remaining <= 5) {
    return { due: false, reason: "quota_protected" };
  }

  const nowMs = input.now.getTime();
  const reservedUntil = parsedTime(input.state?.next_eligible_at);
  if (reservedUntil !== null && reservedUntil > nowMs) {
    return {
      due: false,
      reason: "not_due",
      next_eligible_at: new Date(reservedUntil).toISOString(),
    };
  }

  const lastCompleted = parsedTime(input.state?.last_completed_at);
  const eligibleAt = lastCompleted === null ? nowMs : lastCompleted + interval;
  if (eligibleAt > nowMs) {
    return {
      due: false,
      reason: "not_due",
      next_eligible_at: new Date(eligibleAt).toISOString(),
    };
  }

  return {
    due: true,
    interval_ms: interval,
    next_eligible_at: new Date(nowMs + interval).toISOString(),
  };
}
