import {
  footballSportsFeudAppearanceCountThroughDay,
  ufcSportsFeudAppearanceCountThroughDay,
} from "./sportsFeudDailyBanks";

export type SportsFeudHostSport = "ufc" | "nfl" | "cfb";

export const SPORTS_FEUD_MAIN_STAGE_ASSET = "/assets/sports-feud-main-stage.png";
export const SPORTS_FEUD_FAST_MONEY_STAGE_ASSET = "/assets/sports-feud-fast-money-stage.png";

export const SPORTS_FEUD_HOSTS: Record<SportsFeudHostSport, readonly [string, string, string]> = {
  ufc: ["/assets/1ufc.png", "/assets/2ufc.png", "/assets/3ufc.png"],
  nfl: ["/assets/1nfl.png", "/assets/2nfl.png", "/assets/3nfl.png"],
  cfb: ["/assets/1cfb.png", "/assets/2cfb.png", "/assets/3cfb.png"],
};

const SPORTS_FEUD_FIRST_HOST = {
  ufc: 1,
  cfb: 3,
  nfl: 1,
} as const satisfies Record<SportsFeudHostSport, 1 | 2 | 3>;

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function sportsFeudCentralDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function sportsFeudHostAppearanceIndex(
  sport: SportsFeudHostSport,
  dateKey = sportsFeudCentralDateKey(),
) {
  if (sport === "ufc") {
    return Math.max(0, ufcSportsFeudAppearanceCountThroughDay(dateKey) - 1);
  }

  const footballAppearances = footballSportsFeudAppearanceCountThroughDay(dateKey);
  const domainAppearances = sport === "cfb"
    ? Math.ceil(footballAppearances / 2)
    : Math.floor(footballAppearances / 2);
  return Math.max(0, domainAppearances - 1);
}

export function sportsFeudHostNumber(
  sport: SportsFeudHostSport,
  dateKey = sportsFeudCentralDateKey(),
) {
  const appearanceIndex = sportsFeudHostAppearanceIndex(sport, dateKey);
  return mod(SPORTS_FEUD_FIRST_HOST[sport] - 1 + appearanceIndex, 3) + 1;
}

export function sportsFeudHostAsset(
  sport: SportsFeudHostSport,
  dateKey?: string,
) {
  return SPORTS_FEUD_HOSTS[sport][sportsFeudHostNumber(sport, dateKey) - 1];
}
