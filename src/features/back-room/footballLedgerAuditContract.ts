import type { FootballCanonicalPosition } from "./footballFactualStatsCatalog";

export type FootballLedgerAuditLeague = "NFL" | "CFB";
export type FootballLedgerPlayerPoolId =
  | "qb"
  | "rb"
  | "wr"
  | "te"
  | "ol"
  | "dl-edge"
  | "lb"
  | "secondary"
  | "k-p";

export interface FootballLedgerPlayerPoolContract {
  id: FootballLedgerPlayerPoolId;
  label: string;
  positions: readonly FootballCanonicalPosition[];
}

/**
 * Stage 11 audit taxonomy. NFL and CFB intentionally share the exact same player-pool structure.
 * This file defines census/product categories only; objective values remain owned by footballFactualStats.ts.
 */
export const FOOTBALL_LEDGER_PLAYER_POOL_CONTRACTS: readonly FootballLedgerPlayerPoolContract[] = [
  { id: "qb", label: "QB", positions: ["QB"] },
  { id: "rb", label: "RB", positions: ["RB"] },
  { id: "wr", label: "WR", positions: ["WR"] },
  { id: "te", label: "TE", positions: ["TE"] },
  { id: "ol", label: "OL", positions: ["OL"] },
  { id: "dl-edge", label: "DL / EDGE", positions: ["DL"] },
  { id: "lb", label: "LB", positions: ["LB"] },
  { id: "secondary", label: "Secondary", positions: ["DB"] },
  { id: "k-p", label: "K / P", positions: ["K", "P"] },
] as const;

export type FootballLedgerNonPlayerPoolId =
  | "team-seasons"
  | "organization"
  | "head-coaches"
  | "eras-dynasties"
  | "notable-games";

export interface FootballLedgerNonPlayerPoolContract {
  id: FootballLedgerNonPlayerPoolId;
  label: string;
}

export const FOOTBALL_LEDGER_NON_PLAYER_POOL_CONTRACTS: Readonly<Record<
  FootballLedgerAuditLeague,
  readonly FootballLedgerNonPlayerPoolContract[]
>> = {
  NFL: [
    { id: "team-seasons", label: "Team seasons" },
    { id: "organization", label: "Franchises" },
    { id: "head-coaches", label: "Head coaches" },
    { id: "eras-dynasties", label: "Eras / dynasties" },
    { id: "notable-games", label: "Notable games" },
  ],
  CFB: [
    { id: "team-seasons", label: "Team seasons" },
    { id: "organization", label: "Programs" },
    { id: "head-coaches", label: "Head coaches" },
    { id: "eras-dynasties", label: "Eras / dynasties" },
    { id: "notable-games", label: "Notable games" },
  ],
} as const;

export const FOOTBALL_LEDGER_AUDIT_LEAGUES: readonly FootballLedgerAuditLeague[] = ["NFL", "CFB"] as const;
