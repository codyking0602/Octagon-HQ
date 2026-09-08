type ScheduledBout = {
  bout_id?: unknown;
  locks_at?: unknown;
  included_in_picks?: unknown;
  result_status?: unknown;
};

type ScheduledEvent = {
  bouts?: unknown;
};

export interface ScheduledFootballFinalCheck {
  boutId: string;
  league: "nfl" | "college-football";
  espnEventId: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function scheduledFootballFinalChecks(
  value: unknown,
  now = new Date(),
): ScheduledFootballFinalCheck[] {
  const event = asRecord(value) as ScheduledEvent | null;
  const bouts = Array.isArray(event?.bouts) ? event.bouts : [];
  const checks: ScheduledFootballFinalCheck[] = [];

  for (const rawBout of bouts) {
    const bout = asRecord(rawBout) as ScheduledBout | null;
    if (!bout || bout.included_in_picks === false || bout.result_status !== "pending") continue;

    const locksAt = typeof bout.locks_at === "string" ? Date.parse(bout.locks_at) : Number.NaN;
    if (!Number.isFinite(locksAt) || locksAt > now.getTime()) continue;

    const boutId = typeof bout.bout_id === "string" ? bout.bout_id : "";
    const match = /^football-(nfl|college-football)-(\d+)$/.exec(boutId);
    if (!match) throw new Error("pending Football game is missing canonical ESPN identity");

    checks.push({
      boutId,
      league: match[1] as ScheduledFootballFinalCheck["league"],
      espnEventId: match[2],
    });
  }

  return checks;
}
