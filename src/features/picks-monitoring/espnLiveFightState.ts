import { canonicalFightPair, fighterMatch } from "../../../supabase/functions/sync-next-ufc-event/normalization";
import type { MonitoringBout, MonitoringEvent } from "./manualMonitoringRunner";

export const ESPN_UFC_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard";

const HOUR_MS = 60 * 60 * 1000;
const EVENT_MATCH_WINDOW_MS = 18 * HOUR_MS;
const FALLBACK_PRELIM_LEAD_MS = 4 * HOUR_MS;
const LIVE_WINDOW_TAIL_MS = 12 * HOUR_MS;

export type EspnLiveFightState = "scheduled" | "live" | "final";

export interface EspnLiveFightObservation {
  bout_id: string;
  state: EspnLiveFightState;
  provider: "espn";
  source_event_id: string;
  source_competition_id: string;
  winner_fighter_slug: string | null;
  observed_at: string;
}

export interface EspnLiveFightAdapterResult {
  status: "matched" | "unmatched" | "ambiguous" | "invalid";
  source_event_id: string | null;
  observations: EspnLiveFightObservation[];
  diagnostics: string[];
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null => (
  value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : null
);
const asArray = (value: unknown) => Array.isArray(value) ? value : [];
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

function competitorName(value: unknown) {
  const competitor = asRecord(value);
  const athlete = asRecord(competitor?.athlete);
  return text(athlete?.fullName) || text(athlete?.displayName);
}

function matchingBout(competition: UnknownRecord, event: MonitoringEvent): MonitoringBout | null {
  const competitors = asArray(competition.competitors).map(asRecord).filter((item): item is UnknownRecord => Boolean(item));
  if (competitors.length !== 2) return null;
  const first = competitorName(competitors[0]);
  const second = competitorName(competitors[1]);
  if (!first || !second) return null;

  const pair = canonicalFightPair(first, second);
  const matches = event.bouts.filter((bout) => (
    canonicalFightPair(bout.red_fighter_name, bout.blue_fighter_name) === pair
    || (
      fighterMatch(bout.red_fighter_name, first)
      && fighterMatch(bout.blue_fighter_name, second)
    )
    || (
      fighterMatch(bout.red_fighter_name, second)
      && fighterMatch(bout.blue_fighter_name, first)
    )
  ));
  return matches.length === 1 ? matches[0] : null;
}

function competitionState(competition: UnknownRecord): EspnLiveFightState | null {
  const status = asRecord(competition.status);
  const type = asRecord(status?.type);
  const state = text(type?.state).toLowerCase();
  const completed = type?.completed === true;
  if (completed || state === "post") return "final";
  if (state === "in") return "live";
  if (state === "pre") return "scheduled";
  return null;
}

function winnerSlug(competition: UnknownRecord, bout: MonitoringBout, state: EspnLiveFightState) {
  if (state !== "final") return null;
  const winners = asArray(competition.competitors)
    .map(asRecord)
    .filter((item): item is UnknownRecord => Boolean(item?.winner === true));
  if (winners.length !== 1) return null;
  const name = competitorName(winners[0]);
  if (fighterMatch(bout.red_fighter_name, name)) return bout.red_fighter_slug;
  if (fighterMatch(bout.blue_fighter_name, name)) return bout.blue_fighter_slug;
  return null;
}

function eventStartMs(value: UnknownRecord) {
  const parsed = Date.parse(text(value.date));
  return Number.isFinite(parsed) ? parsed : null;
}

export function shouldPollEspnLiveFightState(event: MonitoringEvent, now: Date) {
  const mainStart = Date.parse(event.starts_at);
  if (!Number.isFinite(mainStart)) return false;
  const prelimStart = event.prelims_starts_at ? Date.parse(event.prelims_starts_at) : Number.NaN;
  const opensAt = Number.isFinite(prelimStart)
    ? Math.min(mainStart, prelimStart)
    : mainStart - FALLBACK_PRELIM_LEAD_MS;
  return now.getTime() >= opensAt && now.getTime() <= mainStart + LIVE_WINDOW_TAIL_MS;
}

export function adaptEspnUfcLiveFightState(input: {
  body: unknown;
  event: MonitoringEvent;
  observedAt: string;
}): EspnLiveFightAdapterResult {
  const root = asRecord(input.body);
  const observedAtMs = Date.parse(input.observedAt);
  const canonicalStart = Date.parse(input.event.starts_at);
  if (!root || !Number.isFinite(observedAtMs) || !Number.isFinite(canonicalStart)) {
    return {
      status: "invalid",
      source_event_id: null,
      observations: [],
      diagnostics: ["ESPN live-state payload or canonical event time was invalid."],
    };
  }

  const candidates = asArray(root.events)
    .map(asRecord)
    .filter((event): event is UnknownRecord => Boolean(event))
    .map((event) => {
      const sourceStart = eventStartMs(event);
      if (sourceStart === null || Math.abs(sourceStart - canonicalStart) > EVENT_MATCH_WINDOW_MS) {
        return { event, matches: [] as Array<{ competition: UnknownRecord; bout: MonitoringBout }> };
      }
      const matches = asArray(event.competitions)
        .map(asRecord)
        .filter((competition): competition is UnknownRecord => Boolean(competition))
        .flatMap((competition) => {
          const bout = matchingBout(competition, input.event);
          return bout ? [{ competition, bout }] : [];
        });
      return { event, matches };
    })
    .filter((candidate) => candidate.matches.length > 0);

  if (!candidates.length) {
    return {
      status: "unmatched",
      source_event_id: null,
      observations: [],
      diagnostics: ["No ESPN UFC event confidently matched the canonical Picks card."],
    };
  }

  const maxMatches = Math.max(...candidates.map((candidate) => candidate.matches.length));
  const best = candidates.filter((candidate) => candidate.matches.length === maxMatches);
  if (best.length !== 1) {
    return {
      status: "ambiguous",
      source_event_id: null,
      observations: [],
      diagnostics: ["Multiple ESPN UFC events matched the canonical Picks card equally well."],
    };
  }

  const selected = best[0];
  const sourceEventId = text(selected.event.id);
  if (!sourceEventId) {
    return {
      status: "invalid",
      source_event_id: null,
      observations: [],
      diagnostics: ["The matched ESPN UFC event did not include a stable event id."],
    };
  }

  const diagnostics: string[] = [];
  const observations = selected.matches.flatMap(({ competition, bout }) => {
    const state = competitionState(competition);
    const sourceCompetitionId = text(competition.id);
    if (!state || !sourceCompetitionId) {
      diagnostics.push(`ESPN competition for ${bout.bout_id} did not expose a supported live state and stable id.`);
      return [];
    }
    return [{
      bout_id: bout.bout_id,
      state,
      provider: "espn" as const,
      source_event_id: sourceEventId,
      source_competition_id: sourceCompetitionId,
      winner_fighter_slug: winnerSlug(competition, bout, state),
      observed_at: new Date(observedAtMs).toISOString(),
    }];
  });

  return {
    status: "matched",
    source_event_id: sourceEventId,
    observations,
    diagnostics,
  };
}
