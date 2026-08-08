import { fighterMatch } from "../../../supabase/functions/sync-next-ufc-event/normalization.ts";
import {
  MMA_ODDS_SPORT_KEY,
  MONEYLINE_MARKET_KEY,
  PREFERRED_ODDS_BOOKMAKERS,
  THE_ODDS_API_PROVIDER,
  fightOddsMatchupIdentity,
  fighterOddsIdentity,
  isValidAmericanOdds,
  normalizedOddsPrice,
  type NormalizedFightOddsSnapshot,
  type OddsAdapterDiagnostic,
  type OddsAdapterResult,
  type OddsProviderQuota,
  type PreferredOddsBookmaker,
} from "./oddsModel.ts";

const DEFAULT_API_ORIGIN = "https://api.the-odds-api.com";

type UnknownRecord = Record<string, unknown>;
type HeaderSource = Headers | Record<string, string | number | undefined>;

interface EventCandidate {
  sourceEventId: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  matchupIdentity: string;
  raw: UnknownRecord;
}

interface CompleteBookmakerSnapshot {
  sportsbook: PreferredOddsBookmaker;
  sportsbookTitle: string;
  sportsbookUpdatedAt: string;
  prices: NormalizedFightOddsSnapshot["prices"];
}

export interface TheOddsApiHttpResponse {
  status: number;
  body: unknown;
  headers?: HeaderSource;
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function validIsoTimestamp(value: unknown) {
  const candidate = nonEmptyString(value);
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : "";
}

function sameFighterName(left: string, right: string) {
  return fighterMatch(left, right) || fighterMatch(right, left);
}

function headerValue(headers: HeaderSource | undefined, key: string) {
  if (!headers) return "";
  const candidate = headers as { get?: (name: string) => string | null };
  if (typeof candidate.get === "function") return candidate.get(key) ?? "";
  const record = headers as Record<string, string | number | undefined>;
  const matchedKey = Object.keys(record).find((name) => name.toLowerCase() === key.toLowerCase());
  return matchedKey ? String(record[matchedKey] ?? "") : "";
}

function quotaInteger(value: string) {
  if (!/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function sanitizedProviderMessage(body: unknown, status: number) {
  const record = asRecord(body);
  const message = nonEmptyString(record?.message) || nonEmptyString(record?.error_code);
  if (!message || message.length > 180 || /api[_-]?key|https?:\/\/|[?&]key=/i.test(message)) {
    return `The Odds API request failed with status ${status}.`;
  }
  return message;
}

export function readTheOddsApiQuota(headers?: HeaderSource): OddsProviderQuota {
  return {
    requestsRemaining: quotaInteger(headerValue(headers, "x-requests-remaining")),
    requestsUsed: quotaInteger(headerValue(headers, "x-requests-used")),
    lastRequestCost: quotaInteger(headerValue(headers, "x-requests-last")),
  };
}

export function buildTheOddsApiRequestUrl(apiKey: string, origin = DEFAULT_API_ORIGIN) {
  if (!apiKey.trim()) throw new Error("The Odds API key is required.");
  const url = new URL(`/v4/sports/${MMA_ODDS_SPORT_KEY}/odds`, origin);
  url.searchParams.set("apiKey", apiKey.trim());
  url.searchParams.set("markets", MONEYLINE_MARKET_KEY);
  url.searchParams.set("bookmakers", PREFERRED_ODDS_BOOKMAKERS.join(","));
  url.searchParams.set("oddsFormat", "american");
  url.searchParams.set("dateFormat", "iso");
  return url;
}

function invalidEventDiagnostic(sourceEventId: string, message: string): OddsAdapterDiagnostic {
  return {
    code: "invalid_event",
    severity: "error",
    message,
    ...(sourceEventId ? { sourceEventId } : {}),
  };
}

function parseEventCandidate(value: unknown): { candidate?: EventCandidate; diagnostic?: OddsAdapterDiagnostic } {
  const event = asRecord(value);
  if (!event) return { diagnostic: invalidEventDiagnostic("", "The provider returned a non-object MMA event.") };

  const sourceEventId = nonEmptyString(event.id);
  const sportKey = nonEmptyString(event.sport_key);
  const commenceTime = validIsoTimestamp(event.commence_time);
  const homeTeam = nonEmptyString(event.home_team);
  const awayTeam = nonEmptyString(event.away_team);
  const homeIdentity = fighterOddsIdentity(homeTeam);
  const awayIdentity = fighterOddsIdentity(awayTeam);

  if (!sourceEventId || sportKey !== MMA_ODDS_SPORT_KEY || !commenceTime || !homeIdentity || !awayIdentity || homeIdentity === awayIdentity) {
    return {
      diagnostic: invalidEventDiagnostic(
        sourceEventId,
        "The provider event is missing a valid MMA identity, start time, or distinct fighter pairing.",
      ),
    };
  }

  return {
    candidate: {
      sourceEventId,
      commenceTime,
      homeTeam,
      awayTeam,
      matchupIdentity: fightOddsMatchupIdentity(homeTeam, awayTeam),
      raw: event,
    },
  };
}

function completeBookmakerSnapshot(
  event: EventCandidate,
  sportsbook: PreferredOddsBookmaker,
): CompleteBookmakerSnapshot | null {
  const bookmakers = Array.isArray(event.raw.bookmakers) ? event.raw.bookmakers.map(asRecord).filter(Boolean) as UnknownRecord[] : [];
  const matches = bookmakers.filter((bookmaker) => nonEmptyString(bookmaker.key) === sportsbook);
  if (matches.length !== 1) return null;

  const bookmaker = matches[0];
  const sportsbookTitle = nonEmptyString(bookmaker.title) || sportsbook;
  const sportsbookUpdatedAt = validIsoTimestamp(bookmaker.last_update);
  if (!sportsbookUpdatedAt) return null;

  const markets = Array.isArray(bookmaker.markets) ? bookmaker.markets.map(asRecord).filter(Boolean) as UnknownRecord[] : [];
  const moneylines = markets.filter((market) => nonEmptyString(market.key) === MONEYLINE_MARKET_KEY);
  if (moneylines.length !== 1) return null;

  const outcomes = Array.isArray(moneylines[0].outcomes)
    ? moneylines[0].outcomes.map(asRecord).filter(Boolean) as UnknownRecord[]
    : [];
  if (outcomes.length !== 2) return null;

  const fighterNames = [event.homeTeam, event.awayTeam];
  const prices = new Map<string, ReturnType<typeof normalizedOddsPrice>>();

  for (const outcome of outcomes) {
    const outcomeName = nonEmptyString(outcome.name);
    const matchingNames = fighterNames.filter((fighterName) => sameFighterName(fighterName, outcomeName));
    if (matchingNames.length !== 1 || !isValidAmericanOdds(outcome.price)) return null;
    const fighterName = matchingNames[0];
    const identity = fighterOddsIdentity(fighterName);
    if (prices.has(identity)) return null;
    prices.set(identity, normalizedOddsPrice(fighterName, outcome.price));
  }

  if (prices.size !== 2) return null;
  const ordered = [...prices.values()].sort((left, right) => left.fighterIdentity.localeCompare(right.fighterIdentity));
  return {
    sportsbook,
    sportsbookTitle,
    sportsbookUpdatedAt,
    prices: [ordered[0], ordered[1]],
  };
}

function missingSnapshotDiagnostic(event: EventCandidate): OddsAdapterDiagnostic {
  return {
    code: "missing_complete_bookmaker",
    severity: "warning",
    message: "Neither DraftKings nor FanDuel supplied one complete two-fighter moneyline snapshot.",
    sourceEventId: event.sourceEventId,
    matchupIdentity: event.matchupIdentity,
  };
}

function normalizePayload(payload: unknown, fetchedAt: string, quota: OddsProviderQuota): OddsAdapterResult {
  if (!Array.isArray(payload)) {
    return {
      snapshots: [],
      diagnostics: [{
        code: "invalid_payload",
        severity: "error",
        message: "The Odds API payload must be an array of MMA events.",
      }],
      coverage: { providerEvents: 0, completeSnapshots: 0, missingSnapshots: 0 },
      quota,
    };
  }

  const diagnostics: OddsAdapterDiagnostic[] = [];
  const candidates: EventCandidate[] = [];
  for (const value of payload) {
    const parsed = parseEventCandidate(value);
    if (parsed.candidate) candidates.push(parsed.candidate);
    if (parsed.diagnostic) diagnostics.push(parsed.diagnostic);
  }

  const grouped = new Map<string, EventCandidate[]>();
  for (const candidate of candidates) {
    grouped.set(candidate.matchupIdentity, [...(grouped.get(candidate.matchupIdentity) ?? []), candidate]);
  }

  const snapshots: NormalizedFightOddsSnapshot[] = [];
  for (const [matchupIdentity, events] of grouped) {
    if (events.length !== 1) {
      diagnostics.push({
        code: "ambiguous_matchup",
        severity: "error",
        message: "The provider returned multiple events for the same normalized fighter pairing.",
        matchupIdentity,
      });
      continue;
    }

    const event = events[0];
    const selected = PREFERRED_ODDS_BOOKMAKERS
      .map((sportsbook) => completeBookmakerSnapshot(event, sportsbook))
      .find((snapshot): snapshot is CompleteBookmakerSnapshot => Boolean(snapshot));
    if (!selected) {
      diagnostics.push(missingSnapshotDiagnostic(event));
      continue;
    }

    snapshots.push({
      provider: THE_ODDS_API_PROVIDER,
      sportKey: MMA_ODDS_SPORT_KEY,
      sourceEventId: event.sourceEventId,
      sourceEventIdentity: `${MMA_ODDS_SPORT_KEY}:${event.sourceEventId}`,
      matchupIdentity: event.matchupIdentity,
      commenceTime: event.commenceTime,
      sportsbook: selected.sportsbook,
      sportsbookTitle: selected.sportsbookTitle,
      sportsbookUpdatedAt: selected.sportsbookUpdatedAt,
      fetchedAt,
      prices: selected.prices,
    });
  }

  snapshots.sort((left, right) => left.commenceTime.localeCompare(right.commenceTime) || left.matchupIdentity.localeCompare(right.matchupIdentity));
  return {
    snapshots,
    diagnostics,
    coverage: {
      providerEvents: payload.length,
      completeSnapshots: snapshots.length,
      missingSnapshots: Math.max(0, payload.length - snapshots.length),
    },
    quota,
  };
}

export function adaptTheOddsApiResponse(response: TheOddsApiHttpResponse, fetchedAt: string): OddsAdapterResult {
  const quota = readTheOddsApiQuota(response.headers);
  if (!Number.isInteger(response.status) || response.status < 200 || response.status >= 300) {
    return {
      snapshots: [],
      diagnostics: [{
        code: "provider_http_error",
        severity: "error",
        message: sanitizedProviderMessage(response.body, response.status),
      }],
      coverage: { providerEvents: 0, completeSnapshots: 0, missingSnapshots: 0 },
      quota,
    };
  }

  if (!validIsoTimestamp(fetchedAt)) {
    return {
      snapshots: [],
      diagnostics: [{
        code: "invalid_payload",
        severity: "error",
        message: "The odds fetch timestamp must be a valid ISO timestamp.",
      }],
      coverage: { providerEvents: 0, completeSnapshots: 0, missingSnapshots: 0 },
      quota,
    };
  }

  return normalizePayload(response.body, fetchedAt, quota);
}
