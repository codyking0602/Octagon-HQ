export interface WeeklyAuctionTeam {
  season_reference: string;
  season_year: number;
  school: string;
  conference_bucket: string;
  display_label: string;
  hidden_grade: number;
  origin: "approved_anchor" | "audited_expansion";
}

export interface WeeklyAuctionDay {
  theme: string;
  shape: string;
  teams: WeeklyAuctionTeam[];
}

export interface WeeklyAuctionBoard {
  version: string;
  seed: number;
  days: WeeklyAuctionDay[];
}

export const WEEKLY_AUCTION_ELITE_GRADE: number;
export const WEEKLY_AUCTION_MIN_ELITES: number;
export const WEEKLY_AUCTION_MAX_ELITES: number;
export const WEEKLY_AUCTION_THEME_COUNTS: Readonly<Record<string, number>>;
export const WEEKLY_AUCTION_SHAPE_WEIGHTS: Readonly<Record<string, number>>;

export function loadWeeklyAuctionPool(rootDir?: string): WeeklyAuctionTeam[];
export function generateWeeklyAuctionBoard(pool: WeeklyAuctionTeam[], seed?: number): WeeklyAuctionBoard;
export function validateWeeklyAuctionBoard(board: WeeklyAuctionBoard): string[];
export function simulateBoardGenerator(
  pool: WeeklyAuctionTeam[],
  weeks?: number,
  seed?: number,
): Record<string, unknown>;
export function simulateAuctionMarket(
  pool: WeeklyAuctionTeam[],
  playersCount: number,
  weeks?: number,
  seed?: number,
): Record<string, unknown>;
