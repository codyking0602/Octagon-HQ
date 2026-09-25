import {
  canonicalFighterDisplay,
  normalizeFighter,
} from "../../../supabase/functions/sync-next-ufc-event/normalization.ts";

export const THE_ODDS_API_PROVIDER = "the-odds-api" as const;
export const MMA_ODDS_SPORT_KEY = "mma_mixed_martial_arts" as const;
export const MONEYLINE_MARKET_KEY = "h2h" as const;
export const PREFERRED_ODDS_BOOKMAKERS = ["draftkings", "fanduel", "betmgm", "caesars"] as const;

export type PreferredOddsBookmaker = typeof PREFERRED_ODDS_BOOKMAKERS[number];

export interface NormalizedOddsPrice {
  fighterName: string;
  fighterIdentity: string;
  americanOdds: number;
}

export interface NormalizedFightOddsSnapshot {
  provider: typeof THE_ODDS_API_PROVIDER;
  sportKey: typeof MMA_ODDS_SPORT_KEY;
  sourceEventId: string;
  sourceEventIdentity: string;
  matchupIdentity: string;
  commenceTime: string;
  sportsbook: PreferredOddsBookmaker;
  sportsbookTitle: string;
  sportsbookUpdatedAt: string;
  fetchedAt: string;
  prices: readonly [NormalizedOddsPrice, NormalizedOddsPrice];
}

export type OddsAdapterDiagnosticCode =
  | "provider_http_error"
  | "invalid_payload"
  | "invalid_event"
  | "ambiguous_matchup"
  | "missing_complete_bookmaker";

export interface OddsAdapterDiagnostic {
  code: OddsAdapterDiagnosticCode;
  severity: "warning" | "error";
  message: string;
  sourceEventId?: string;
  matchupIdentity?: string;
}

export interface OddsProviderQuota {
  requestsRemaining: number | null;
  requestsUsed: number | null;
  lastRequestCost: number | null;
}

export interface OddsAdapterCoverage {
  providerEvents: number;
  completeSnapshots: number;
  missingSnapshots: number;
}

export interface OddsAdapterResult {
  snapshots: NormalizedFightOddsSnapshot[];
  diagnostics: OddsAdapterDiagnostic[];
  coverage: OddsAdapterCoverage;
  quota: OddsProviderQuota;
}

const fighterOddsIdentityAliases = new Map([
  ["mehemmedeli osmanli", "mahammadali osmanli"],
  ["valesca machado", "tina black"],
]);

export function fighterOddsIdentity(value: string) {
  const normalized = normalizeFighter(value);
  return fighterOddsIdentityAliases.get(normalized) ?? normalized;
}

export function sameOddsFighterIdentity(left: string, right: string) {
  return fighterOddsIdentity(left) === fighterOddsIdentity(right);
}

export function fightOddsMatchupIdentity(left: string, right: string) {
  return [fighterOddsIdentity(left), fighterOddsIdentity(right)].sort().join("|");
}

export function normalizedOddsPrice(name: string, americanOdds: number): NormalizedOddsPrice {
  return {
    fighterName: canonicalFighterDisplay(name),
    fighterIdentity: fighterOddsIdentity(name),
    americanOdds,
  };
}

export function isValidAmericanOdds(value: unknown): value is number {
  return Number.isInteger(value) && ((value as number) <= -100 || (value as number) >= 100);
}
